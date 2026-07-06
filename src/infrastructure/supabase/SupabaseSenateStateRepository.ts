import { ISenateStateRepository, UpdateSenateStateInput } from "@/domain/repositories/ISenateStateRepository";
import { SenateState } from "@/domain/entities/SenateState";
import { createServiceClient } from "./client";
import { mapSenateState } from "./mappers";

export class SupabaseSenateStateRepository implements ISenateStateRepository {
  async get(): Promise<SenateState> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("senate_state")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw new Error(error.message);
    return mapSenateState(data);
  }

  async update(input: UpdateSenateStateInput): Promise<SenateState> {
    const supabase = createServiceClient();
    const current = await this.get();

    const payload: Record<string, unknown> = {
      updated_by: input.updatedBy,
      updated_at: new Date().toISOString(),
    };

    if (input.liveTopic !== undefined) payload.live_topic = input.liveTopic;
    if (input.isLive !== undefined) payload.is_live = input.isLive;
    if (input.activeProjects !== undefined) payload.active_projects = input.activeProjects;
    if (input.activeDispatches !== undefined) payload.active_dispatches = input.activeDispatches;
    if (input.openQuestions !== undefined) payload.open_questions = input.openQuestions;
    if (input.activeDebates !== undefined) payload.active_debates = input.activeDebates;
    if (input.nextSessionAt !== undefined) payload.next_session_at = input.nextSessionAt;
    if (input.sessionDurationMinutes !== undefined) payload.session_duration_minutes = input.sessionDurationMinutes;

    const { data, error } = await supabase
      .from("senate_state")
      .update(payload)
      .eq("id", current.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapSenateState(data);
  }
}