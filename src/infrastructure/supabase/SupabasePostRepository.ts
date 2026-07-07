import { IPostRepository, CreatePostInput } from "@/domain/repositories/IPostRepository";
import { Post, PostStatus, PostTag, PostWithAuthor } from "@/domain/entities/Post";
import { createServiceClient } from "./client";
import { mapPost, mapPostWithAuthor } from "./mappers";

const POST_SELECT = `
  *,
  author:profiles!posts_author_id_fkey(id, display_name, username, media_outlet, avatar_url),
  target_senator:senators(id, full_name, party),
  target_journalist:profiles!posts_target_journalist_id_fkey(id, display_name, username)
`;

export class SupabasePostRepository implements IPostRepository {
  async create(input: CreatePostInput): Promise<Post> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: input.authorId,
        content: input.content,
        tag: input.tag,
        image_url: input.imageUrl ?? null,
        target_senator_id: input.targetSenatorId ?? null,
        target_journalist_id: input.targetJournalistId ?? null,
        parent_post_id: input.parentPostId ?? null,
        status: input.status,
        moderation_note: input.moderationNote ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapPost(data);
  }

  private async enrichWithAuthors(rows: Record<string, unknown>[]): Promise<PostWithAuthor[]> {
    if (rows.length === 0) return [];

    const supabase = createServiceClient();
    const authorIds = [...new Set(rows.map((p) => p.author_id as string))];
    const { data: authors } = await supabase
      .from("profiles")
      .select("id, display_name, username, media_outlet, avatar_url")
      .in("id", authorIds);

    const authorMap = new Map((authors ?? []).map((a) => [a.id, a]));

    return rows.map((row) =>
      mapPostWithAuthor({
        ...row,
        author: authorMap.get(row.author_id as string),
      })
    );
  }

  private async queryPosts(options: {
    status?: PostStatus | PostStatus[];
    parentPostIdNull?: boolean;
    parentPostIds?: string[];
    filterType?: string;
    tag?: PostTag | "all";
    limit?: number;
    orderAsc?: boolean;
  }): Promise<PostWithAuthor[]> {
    const supabase = createServiceClient();
    let query = supabase.from("posts").select(POST_SELECT);

    if (options.status) {
      if (Array.isArray(options.status)) {
        query = query.in("status", options.status);
      } else {
        query = query.eq("status", options.status);
      }
    }

    if (options.parentPostIdNull) {
      query = query.is("parent_post_id", null);
    }

    if (options.parentPostIds?.length) {
      query = query.in("parent_post_id", options.parentPostIds);
    }

    const filterType = options.filterType ?? "todo";
    if (filterType === "debate") query = query.eq("tag", "debate");
    else if (filterType === "sesion") query = query.eq("tag", "sesion");
    else if (filterType === "preguntas") query = query.eq("tag", "pregunta");
    else if (filterType === "senadores") query = query.not("target_senator_id", "is", null);
    else if (options.tag && options.tag !== "all") query = query.eq("tag", options.tag);

    query = query.order("created_at", { ascending: options.orderAsc ?? false });

    if (options.limit) query = query.limit(options.limit);

    const { data, error } = await query;

    if (!error && data) {
      return data.map((row) => mapPostWithAuthor(row));
    }

    let plainQuery = supabase.from("posts").select("*");

    if (options.status) {
      if (Array.isArray(options.status)) {
        plainQuery = plainQuery.in("status", options.status);
      } else {
        plainQuery = plainQuery.eq("status", options.status);
      }
    }
    if (options.parentPostIdNull) plainQuery = plainQuery.is("parent_post_id", null);
    if (options.parentPostIds?.length) plainQuery = plainQuery.in("parent_post_id", options.parentPostIds);
    if (filterType === "debate") plainQuery = plainQuery.eq("tag", "debate");
    else if (filterType === "sesion") plainQuery = plainQuery.eq("tag", "sesion");
    else if (filterType === "preguntas") plainQuery = plainQuery.eq("tag", "pregunta");
    else if (filterType === "senadores") plainQuery = plainQuery.not("target_senator_id", "is", null);

    plainQuery = plainQuery.order("created_at", { ascending: options.orderAsc ?? false });
    if (options.limit) plainQuery = plainQuery.limit(options.limit);

    const { data: plain, error: plainError } = await plainQuery;
    if (plainError) throw new Error(plainError.message);

    return this.enrichWithAuthors(plain ?? []);
  }

  async findApproved(filters?: { tag?: PostTag | "all"; filterType?: string }): Promise<PostWithAuthor[]> {
    const topLevel = await this.queryPosts({
      status: "approved",
      parentPostIdNull: true,
      filterType: filters?.filterType,
      tag: filters?.tag,
      limit: 50,
    });

    return this.attachReplies(topLevel);
  }

  private async attachReplies(posts: PostWithAuthor[]): Promise<PostWithAuthor[]> {
    if (posts.length === 0) return posts;

    const replies = await this.queryPosts({
      status: "approved",
      parentPostIds: posts.map((p) => p.id),
      orderAsc: true,
    });

    return posts.map((post) => ({
      ...post,
      replies: replies.filter((r) => r.parentPostId === post.id),
      replyCount: replies.filter((r) => r.parentPostId === post.id).length,
    }));
  }

  async findPending(): Promise<PostWithAuthor[]> {
    return this.queryPosts({
      status: ["pending", "rejected"],
    });
  }

  async findAllForAdmin(): Promise<PostWithAuthor[]> {
    return this.queryPosts({ limit: 100 });
  }

  async findById(id: string): Promise<PostWithAuthor | null> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (!error && data) return mapPostWithAuthor(data);

    const { data: plain } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
    if (!plain) return null;

    const enriched = await this.enrichWithAuthors([plain]);
    return enriched[0] ?? null;
  }

  async updateStatus(id: string, status: PostStatus, moderatedBy: string, note?: string): Promise<Post> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("posts")
      .update({
        status,
        moderated_by: moderatedBy,
        moderated_at: new Date().toISOString(),
        moderation_note: note ?? null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapPost(data);
  }

  async block(id: string, moderatedBy: string, note: string): Promise<Post> {
    return this.updateStatus(id, "blocked", moderatedBy, note);
  }

  async delete(id: string): Promise<void> {
    const supabase = createServiceClient();
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}