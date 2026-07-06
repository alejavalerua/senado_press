import {
  ISenatorRepository,
  CreateSenatorInput,
  UpdateSenatorInput,
} from "@/domain/repositories/ISenatorRepository";
import { Senator } from "@/domain/entities/Senator";
import { createServiceClient } from "./client";
import { mapSenator } from "./mappers";

export class SupabaseSenatorRepository implements ISenatorRepository {
  async findAll(includeInactive = false): Promise<Senator[]> {
    const supabase = createServiceClient();
    let query = supabase.from("senators").select("*").order("full_name");

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSenator);
  }

  async findById(id: string): Promise<Senator | null> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("senators")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return mapSenator(data);
  }

  async create(input: CreateSenatorInput): Promise<Senator> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("senators")
      .insert({
        full_name: input.fullName,
        party: input.party,
        caucus: input.caucus ?? null,
        photo_url: input.photoUrl ?? null,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapSenator(data);
  }

  async update(id: string, input: UpdateSenatorInput): Promise<Senator> {
    const supabase = createServiceClient();
    const payload: Record<string, unknown> = {};

    if (input.fullName !== undefined) payload.full_name = input.fullName;
    if (input.party !== undefined) payload.party = input.party;
    if (input.caucus !== undefined) payload.caucus = input.caucus;
    if (input.photoUrl !== undefined) payload.photo_url = input.photoUrl;
    if (input.isActive !== undefined) payload.is_active = input.isActive;

    const { data, error } = await supabase
      .from("senators")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapSenator(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("senators")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw new Error(error.message);
  }
}