import { Profile, ProfileWithPassword } from "../entities/Profile";

export interface CreateProfileInput {
  username: string;
  displayName: string;
  email: string;
  passwordHash: string;
  mediaOutlet?: string | null;
  role?: "journalist" | "admin";
}

export interface UpdateJournalistInput {
  displayName?: string;
  email?: string;
  isActive?: boolean;
  mediaOutlet?: string | null;
}

export interface IAuthRepository {
  findByUsername(username: string): Promise<ProfileWithPassword | null>;
  findByEmail(email: string): Promise<ProfileWithPassword | null>;
  findByEmailOrUsername(identifier: string): Promise<ProfileWithPassword | null>;
  findById(id: string): Promise<Profile | null>;
  create(input: CreateProfileInput): Promise<Profile>;
  findAllJournalists(): Promise<Profile[]>;
  updateJournalist(id: string, input: UpdateJournalistInput): Promise<Profile>;
  isUsernameTaken(username: string): Promise<boolean>;
  isEmailTaken(email: string): Promise<boolean>;
}