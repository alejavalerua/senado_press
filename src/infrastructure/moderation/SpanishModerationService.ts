import { IModerationService, ModerationResult } from "@/domain/services/IModerationService";

const BANNED_WORDS = [
  "puta", "puto", "mierda", "hijueputa", "hijo de puta", "marica", "gonorrea",
  "imbécil", "imbecil", "estúpido", "estupido", "idiota", "pendejo", "culero",
  "carajo", "verga", "chingada", "chingado", "joder", "coño", "cono",
  "malparido", "hp", "mk", "mka", "ptm", "ctm", "fuck", "shit", "bitch",
  "asshole", "damn", "bastard", "cabrón", "cabron", "zorra", "perra",
  "asqueroso", "asco", "basura humana", "retardado", "retrasado",
];

const SUSPICIOUS_PATTERNS = [
  /\b(kill|matar|muerte a)\b/i,
  /\b(odio|hate)\s+(a|al|a la)\b/i,
];

export class SpanishModerationService implements IModerationService {
  moderate(content: string): ModerationResult {
    const normalized = content
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const flaggedWords: string[] = [];

    for (const word of BANNED_WORDS) {
      const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (pattern.test(normalized) || normalized.includes(word)) {
        flaggedWords.push(word);
      }
    }

    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(content)) {
        flaggedWords.push("contenido_sospechoso");
      }
    }

    const excessiveCaps = content.replace(/[^A-ZÁÉÍÓÚÑ]/g, "").length > content.length * 0.6 && content.length > 20;
    if (excessiveCaps) {
      flaggedWords.push("mayusculas_excesivas");
    }

    const isClean = flaggedWords.length === 0;

    return {
      isClean,
      flaggedWords,
      reason: isClean
        ? null
        : `Contenido marcado para revisión: ${flaggedWords.slice(0, 3).join(", ")}`,
    };
  }
}