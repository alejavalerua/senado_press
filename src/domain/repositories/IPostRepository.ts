import { Post, PostStatus, PostTag, PostWithAuthor } from "../entities/Post";

export interface CreatePostInput {
  authorId: string;
  content: string;
  tag: PostTag;
  imageUrl?: string | null;
  targetSenatorId?: string | null;
  targetJournalistId?: string | null;
  parentPostId?: string | null;
  status: PostStatus;
  moderationNote?: string | null;
}

export interface IPostRepository {
  create(input: CreatePostInput): Promise<Post>;
  findApproved(filters?: { tag?: PostTag | "all"; filterType?: string }): Promise<PostWithAuthor[]>;
  findPending(): Promise<PostWithAuthor[]>;
  findAllForAdmin(): Promise<PostWithAuthor[]>;
  findById(id: string): Promise<PostWithAuthor | null>;
  updateStatus(id: string, status: PostStatus, moderatedBy: string, note?: string): Promise<Post>;
  block(id: string, moderatedBy: string, note: string): Promise<Post>;
}