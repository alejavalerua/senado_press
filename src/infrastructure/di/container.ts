import { LoginUseCase } from "@/application/use-cases/LoginUseCase";
import { RegisterUseCase } from "@/application/use-cases/RegisterUseCase";
import { CreatePostUseCase } from "@/application/use-cases/CreatePostUseCase";
import { ModeratePostUseCase } from "@/application/use-cases/ModeratePostUseCase";
import { ToggleReactionUseCase } from "@/application/use-cases/ToggleReactionUseCase";
import { UpdateSenateStateUseCase } from "@/application/use-cases/UpdateSenateStateUseCase";
import { UpdateJournalistUseCase } from "@/application/use-cases/UpdateJournalistUseCase";
import { ManageSenatorUseCase } from "@/application/use-cases/ManageSenatorUseCase";
import { SpanishModerationService } from "@/infrastructure/moderation/SpanishModerationService";
import { InstitutionalEmailService } from "@/infrastructure/validation/InstitutionalEmailService";
import { SupabaseAuthRepository } from "@/infrastructure/supabase/SupabaseAuthRepository";
import { SupabasePostRepository } from "@/infrastructure/supabase/SupabasePostRepository";
import { SupabaseReactionRepository } from "@/infrastructure/supabase/SupabaseReactionRepository";
import { SupabaseSenateStateRepository } from "@/infrastructure/supabase/SupabaseSenateStateRepository";
import { SupabaseSenatorRepository } from "@/infrastructure/supabase/SupabaseSenatorRepository";

const authRepo = new SupabaseAuthRepository();
const postRepo = new SupabasePostRepository();
const reactionRepo = new SupabaseReactionRepository();
const senateStateRepo = new SupabaseSenateStateRepository();
const senatorRepo = new SupabaseSenatorRepository();
const moderationService = new SpanishModerationService();
const emailValidationService = new InstitutionalEmailService();

export const container = {
  authRepo,
  postRepo,
  reactionRepo,
  senateStateRepo,
  senatorRepo,
  moderationService,
  emailValidationService,
  loginUseCase: new LoginUseCase(authRepo),
  registerUseCase: new RegisterUseCase(authRepo, emailValidationService),
  createPostUseCase: new CreatePostUseCase(postRepo, moderationService),
  moderatePostUseCase: new ModeratePostUseCase(postRepo),
  toggleReactionUseCase: new ToggleReactionUseCase(reactionRepo),
  updateSenateStateUseCase: new UpdateSenateStateUseCase(senateStateRepo),
  updateJournalistUseCase: new UpdateJournalistUseCase(authRepo, emailValidationService),
  manageSenatorUseCase: new ManageSenatorUseCase(senatorRepo),
};