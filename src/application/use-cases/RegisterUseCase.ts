import { Profile } from "@/domain/entities/Profile";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { IEmailValidationService } from "@/domain/services/IEmailValidationService";
import bcrypt from "bcryptjs";

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mediaOutlet?: string;
}

export interface RegisterResult {
  success: boolean;
  profile?: Profile;
  error?: string;
}

export class RegisterUseCase {
  constructor(
    private authRepo: IAuthRepository,
    private emailValidation: IEmailValidationService
  ) {}

  async execute(input: RegisterInput): Promise<RegisterResult> {
    const displayName = input.displayName.trim();
    const email = input.email.trim().toLowerCase();

    if (displayName.length < 2) {
      return { success: false, error: "El nombre debe tener al menos 2 caracteres" };
    }

    const emailCheck = this.emailValidation.validateInstitutionalEmail(email);
    if (!emailCheck.valid) {
      return { success: false, error: emailCheck.error };
    }

    if (input.password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres" };
    }

    if (input.password !== input.confirmPassword) {
      return { success: false, error: "Las contraseñas no coinciden" };
    }

    if (await this.authRepo.isEmailTaken(email)) {
      return { success: false, error: "Este correo ya está registrado" };
    }

    const baseUsername = email.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase().slice(0, 40);
    let username = baseUsername || "periodista";
    let suffix = 1;

    while (await this.authRepo.isUsernameTaken(username)) {
      username = `${baseUsername}${suffix}`;
      suffix++;
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const profile = await this.authRepo.create({
      username,
      displayName,
      email,
      passwordHash,
      mediaOutlet: input.mediaOutlet?.trim() || null,
      role: "journalist",
    });

    return { success: true, profile };
  }
}