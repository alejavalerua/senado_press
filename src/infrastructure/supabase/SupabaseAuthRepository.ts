import {
  IAuthRepository,
  CreateProfileInput,
  UpdateJournalistInput,
} from "@/domain/repositories/IAuthRepository";
import { Profile, ProfileWithPassword } from "@/domain/entities/Profile";
import { createServiceClient } from "./client";
import { mapProfile, mapProfileWithPassword } from "./mappers";

export class SupabaseAuthRepository implements IAuthRepository {
  async findByUsername(username: string): Promise<ProfileWithPassword | null> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error || !data) return null;
    return mapProfileWithPassword(data);
  }

  async findByEmail(email: string): Promise<ProfileWithPassword | null> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !data) return null;
    return mapProfileWithPassword(data);
  }

  async findByEmailOrUsername(identifier: string): Promise<ProfileWithPassword | null> {
    if (identifier.includes("@")) {
      return this.findByEmail(identifier);
    }
    return this.findByUsername(identifier);
  }

  async findById(id: string): Promise<Profile | null> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return mapProfile(data);
  }

  async create(input: CreateProfileInput): Promise<Profile> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        username: input.username,
        display_name: input.displayName,
        email: input.email,
        password_hash: input.passwordHash,
        role: input.role ?? "journalist",
        media_outlet: input.mediaOutlet ?? null,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapProfile(data);
  }

  async findAllJournalists(): Promise<Profile[]> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "journalist")
      .order("display_name");

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapProfile);
  }

  async updateJournalist(id: string, input: UpdateJournalistInput): Promise<Profile> {
    const supabase = createServiceClient();
    const payload: Record<string, unknown> = {};

    if (input.displayName !== undefined) payload.display_name = input.displayName;
    if (input.email !== undefined) payload.email = input.email;
    if (input.isActive !== undefined) payload.is_active = input.isActive;
    if (input.mediaOutlet !== undefined) payload.media_outlet = input.mediaOutlet;

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", id)
      .eq("role", "journalist")
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapProfile(data);
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return user !== null;
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }
}