import { SenateState } from "../entities/SenateState";

export interface UpdateSenateStateInput {
  liveTopic?: string;
  isLive?: boolean;
  activeProjects?: number;
  activeDispatches?: number;
  openQuestions?: number;
  activeDebates?: number;
  nextSessionAt?: string | null;
  sessionDurationMinutes?: number;
  updatedBy: string;
}

export interface ISenateStateRepository {
  get(): Promise<SenateState>;
  update(input: UpdateSenateStateInput): Promise<SenateState>;
}