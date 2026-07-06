export interface SenateState {
  id: string;
  liveTopic: string;
  isLive: boolean;
  activeProjects: number;
  activeDispatches: number;
  openQuestions: number;
  activeDebates: number;
  nextSessionAt: string | null;
  sessionDurationMinutes: number;
  updatedAt: string;
}