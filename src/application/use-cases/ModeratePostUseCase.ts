import { Post, PostStatus } from "@/domain/entities/Post";
import { IPostRepository } from "@/domain/repositories/IPostRepository";

export class ModeratePostUseCase {
  constructor(private postRepo: IPostRepository) {}

  async approve(postId: string, adminId: string): Promise<Post> {
    return this.postRepo.updateStatus(postId, "approved", adminId);
  }

  async reject(postId: string, adminId: string, note: string): Promise<Post> {
    return this.postRepo.updateStatus(postId, "rejected", adminId, note);
  }

  async block(postId: string, adminId: string, note: string): Promise<Post> {
    return this.postRepo.block(postId, adminId, note);
  }

  async setStatus(postId: string, status: PostStatus, adminId: string, note?: string): Promise<Post> {
    return this.postRepo.updateStatus(postId, status, adminId, note);
  }
}