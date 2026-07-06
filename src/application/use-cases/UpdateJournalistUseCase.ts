import { Profile } from "@/domain/entities/Profile";
import { IAuthRepository, UpdateJournalistInput } from "@/domain/repositories/IAuthRepository";
import { IEmailValidationService } from "@/domain/services/IEmailValidationService";

export class UpdateJournalistUseCase {
  constructor(
    private authRepo: IAuthRepository,
    private emailValidation: IEmailValidationService
  ) {}

  async execute(id: string, input: UpdateJournalistInput): Promise<Profile> {
    const journalist = await this.authRepo.findById(id);
    if (!journalist || journalist.role !== "journalist") {
      throw new Error("Periodista no encontrado");
    }

    if (input.email) {
      const check = this.emailValidation.validateInstitutionalEmail(input.email);
      if (!check.valid) throw new Error(check.error);
      const existing = await this.authRepo.findByEmail(input.email.trim().toLowerCase());
      if (existing && existing.id !== id) {
        throw new Error("Este correo ya está en uso");
      }
    }

    if (input.displayName !== undefined && input.displayName.trim().length < 2) {
      throw new Error("El nombre debe tener al menos 2 caracteres");
    }

    return this.authRepo.updateJournalist(id, {
      ...input,
      email: input.email?.trim().toLowerCase(),
      displayName: input.displayName?.trim(),
    });
  }
}