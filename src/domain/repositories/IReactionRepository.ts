export interface IReactionRepository {
  toggle(postId: string, userId: string, type: "like" | "dislike"): Promise<"like" | "dislike" | null>;
}