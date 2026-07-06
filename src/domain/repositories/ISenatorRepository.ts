import { Senator } from "../entities/Senator";

export interface CreateSenatorInput {
  fullName: string;
  party: string;
  caucus?: string | null;
  photoUrl?: string | null;
}

export interface UpdateSenatorInput {
  fullName?: string;
  party?: string;
  caucus?: string | null;
  photoUrl?: string | null;
  isActive?: boolean;
}

export interface ISenatorRepository {
  findAll(includeInactive?: boolean): Promise<Senator[]>;
  findById(id: string): Promise<Senator | null>;
  create(input: CreateSenatorInput): Promise<Senator>;
  update(id: string, input: UpdateSenatorInput): Promise<Senator>;
  delete(id: string): Promise<void>;
}