import { IReactionRepository } from "@/domain/repositories/IReactionRepository";
import { createServiceClient } from "./client";

export class SupabaseReactionRepository implements IReactionRepository {
  async toggle(postId: string, userId: string, type: "like" | "dislike"): Promise<"like" | "dislike" | null> {
    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from("reactions")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      if (existing.type === type) {
        await supabase.from("reactions").delete().eq("id", existing.id);
        return null;
      }
      await supabase.from("reactions").update({ type }).eq("id", existing.id);
      return type;
    }

    const { error } = await supabase.from("reactions").insert({
      post_id: postId,
      user_id: userId,
      type,
    });

    if (error) throw new Error(error.message);
    return type;
  }
}