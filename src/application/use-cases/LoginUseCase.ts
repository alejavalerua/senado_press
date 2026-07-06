import { Profile } from "@/domain/entities/Profile";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import bcrypt from "bcryptjs";

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  profile?: Profile;
  error?: string;
}

export class LoginUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const identifier = input.identifier.trim().toLowerCase();
    const user = await this.authRepo.findByEmailOrUsername(identifier);

    if (!user) {
      return { success: false, error: "Correo/usuario o contraseña incorrectos" };
    }

    if (!user.isActive) {
      return { success: false, error: "Tu cuenta está bloqueada. Contacta al Secretario General." };
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Correo/usuario o contraseña incorrectos" };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...profile } = user;
    return { success: true, profile };
  }
}