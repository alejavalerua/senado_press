import { Profile, ProfileWithPassword } from "@/domain/entities/Profile";
import { Post, PostWithAuthor } from "@/domain/entities/Post";
import { Senator } from "@/domain/entities/Senator";
import { SenateState } from "@/domain/entities/SenateState";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProfile(row: any): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    email: row.email ?? null,
    role: row.role,
    mediaOutlet: row.media_outlet,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProfileWithPassword(row: any): ProfileWithPassword {
  return { ...mapProfile(row), passwordHash: row.password_hash };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPost(row: any): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    content: row.content,
    tag: row.tag,
    imageUrl: row.image_url,
    targetSenatorId: row.target_senator_id,
    targetJournalistId: row.target_journalist_id,
    parentPostId: row.parent_post_id ?? null,
    status: row.status,
    moderationNote: row.moderation_note,
    likesCount: row.likes_count ?? 0,
    dislikesCount: row.dislikes_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPostWithAuthor(row: any, userReaction?: "like" | "dislike" | null): PostWithAuthor {
  const author = row.author ?? row.profiles;
  const senator = row.target_senator ?? row.senators;
  const journalist = row.target_journalist;
  const parent = row.parent_post;

  return {
    ...mapPost(row),
    author: author
      ? {
          id: author.id,
          displayName: author.display_name,
          username: author.username,
          mediaOutlet: author.media_outlet,
          avatarUrl: author.avatar_url,
        }
      : { id: row.author_id, displayName: "Periodista", username: "unknown", mediaOutlet: null, avatarUrl: null },
    targetSenator: senator
      ? { id: senator.id, fullName: senator.full_name, party: senator.party }
      : null,
    targetJournalist: journalist
      ? { id: journalist.id, displayName: journalist.display_name, username: journalist.username }
      : null,
    parentPost: parent
      ? {
          id: parent.id,
          content: parent.content,
          author: {
            displayName: parent.author?.display_name ?? "Periodista",
            username: parent.author?.username ?? "unknown",
          },
        }
      : null,
    userReaction: userReaction ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSenator(row: any): Senator {
  return {
    id: row.id,
    fullName: row.full_name,
    party: row.party,
    caucus: row.caucus,
    photoUrl: row.photo_url,
    isActive: row.is_active,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSenateState(row: any): SenateState {
  return {
    id: row.id,
    liveTopic: row.live_topic,
    isLive: row.is_live,
    activeProjects: row.active_projects,
    activeDispatches: row.active_dispatches,
    openQuestions: row.open_questions,
    activeDebates: row.active_debates,
    nextSessionAt: row.next_session_at,
    sessionDurationMinutes: row.session_duration_minutes,
    updatedAt: row.updated_at,
  };
}