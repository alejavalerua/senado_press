export type PostTag = "debate" | "pregunta" | "critica" | "observacion" | "sesion";
export type PostStatus = "pending" | "approved" | "rejected" | "blocked";

export interface Post {
  id: string;
  authorId: string;
  content: string;
  tag: PostTag;
  imageUrl: string | null;
  targetSenatorId: string | null;
  targetJournalistId: string | null;
  parentPostId: string | null;
  status: PostStatus;
  moderationNote: string | null;
  likesCount: number;
  dislikesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    displayName: string;
    username: string;
    mediaOutlet: string | null;
    avatarUrl: string | null;
  };
  targetSenator?: {
    id: string;
    fullName: string;
    party: string;
  } | null;
  targetJournalist?: {
    id: string;
    displayName: string;
    username: string;
  } | null;
  parentPost?: {
    id: string;
    content: string;
    author: { displayName: string; username: string };
  } | null;
  replies?: PostWithAuthor[];
  replyCount?: number;
  userReaction?: "like" | "dislike" | null;
}

export const POST_TAG_LABELS: Record<PostTag, string> = {
  debate: "Debate",
  pregunta: "Pregunta",
  critica: "Crítica",
  observacion: "Observación",
  sesion: "Sesión",
};

export const POST_TAG_COLORS: Record<PostTag, string> = {
  debate: "bg-amber-100 text-amber-800 border-amber-200",
  pregunta: "bg-blue-100 text-blue-800 border-blue-200",
  critica: "bg-rose-100 text-rose-800 border-rose-200",
  observacion: "bg-emerald-100 text-emerald-800 border-emerald-200",
  sesion: "bg-violet-100 text-violet-800 border-violet-200",
};

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  pending: "Pendiente",
  approved: "Publicado",
  rejected: "Rechazado",
  blocked: "Bloqueado",
};