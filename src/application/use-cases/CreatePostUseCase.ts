import { Post, PostTag } from "@/domain/entities/Post";
import { IPostRepository } from "@/domain/repositories/IPostRepository";
import { IModerationService } from "@/domain/services/IModerationService";

export interface CreatePostInput {
  authorId: string;
  content: string;
  tag: PostTag;
  imageUrl?: string | null;
  targetSenatorId?: string | null;
  targetJournalistId?: string | null;
  parentPostId?: string | null;
}

export interface CreatePostResult {
  post: Post;
  autoApproved: boolean;
  moderationMessage: string;
}

export class CreatePostUseCase {
  constructor(
    private postRepo: IPostRepository,
    private moderationService: IModerationService
  ) {}

  async execute(input: CreatePostInput): Promise<CreatePostResult> {
    const trimmed = input.content.trim();
    if (trimmed.length < 3) {
      throw new Error("El mensaje debe tener al menos 3 caracteres");
    }
    if (trimmed.length > 2000) {
      throw new Error("El mensaje no puede superar 2000 caracteres");
    }

    const moderation = this.moderationService.moderate(trimmed);
    const status = moderation.isClean ? "approved" : "pending";

    const post = await this.postRepo.create({
      ...input,
      content: trimmed,
      status,
      moderationNote: moderation.isClean ? null : moderation.reason,
    });

    return {
      post,
      autoApproved: moderation.isClean,
      moderationMessage: moderation.isClean
        ? input.parentPostId
          ? "Respuesta publicada correctamente"
          : "Despacho publicado correctamente"
        : "Tu mensaje está en revisión. Será publicado cuando sea aprobado.",
    };
  }
}