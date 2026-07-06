import { IEmailValidationService, EmailValidationResult } from "@/domain/services/IEmailValidationService";

const DEFAULT_DOMAINS = [
  "edu.co",
  "edu.com",
  "school.edu.co",
  "colegio.edu.co",
  "institucion.edu.co",
];

export class InstitutionalEmailService implements IEmailValidationService {
  private allowedDomains: string[];

  constructor() {
    const envDomains = process.env.ALLOWED_EMAIL_DOMAINS;
    this.allowedDomains = envDomains
      ? envDomains.split(",").map((d) => d.trim().toLowerCase()).filter(Boolean)
      : DEFAULT_DOMAINS;
  }

  validateInstitutionalEmail(email: string): EmailValidationResult {
    const normalized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalized)) {
      return { valid: false, error: "Ingresa un correo electrónico válido" };
    }

    const domain = normalized.split("@")[1];
    const isAllowed = this.allowedDomains.some(
      (allowed) => domain === allowed || domain.endsWith("." + allowed)
    );

    if (!isAllowed) {
      return {
        valid: false,
        error: `Usa un correo institucional (@${this.allowedDomains.slice(0, 2).join(", @")}...)`,
      };
    }

    return { valid: true };
  }
}