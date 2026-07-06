import { IReactionRepository } from "@/domain/repositories/IReactionRepository";

export class ToggleReactionUseCase {
  constructor(private reactionRepo: IReactionRepository) {}

  async execute(postId: string, userId: string, type: "like" | "dislike") {
    return this.reactionRepo.toggle(postId, userId, type);
  }
}