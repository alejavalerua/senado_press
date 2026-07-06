export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

export interface IEmailValidationService {
  validateInstitutionalEmail(email: string): EmailValidationResult;
}