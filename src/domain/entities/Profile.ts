export type UserRole = "journalist" | "admin";
export type JournalistStatus = "libre" | "bloqueado";

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  role: UserRole;
  mediaOutlet: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ProfileWithPassword extends Profile {
  passwordHash: string;
}

export function getJournalistStatus(profile: Profile): JournalistStatus {
  return profile.isActive ? "libre" : "bloqueado";
}