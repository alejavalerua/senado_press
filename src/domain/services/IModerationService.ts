export interface ModerationResult {
  isClean: boolean;
  flaggedWords: string[];
  reason: string | null;
}

export interface IModerationService {
  moderate(content: string): ModerationResult;
}