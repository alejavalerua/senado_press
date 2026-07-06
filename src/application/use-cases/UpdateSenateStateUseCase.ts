import { SenateState } from "@/domain/entities/SenateState";
import { ISenateStateRepository, UpdateSenateStateInput } from "@/domain/repositories/ISenateStateRepository";

export class UpdateSenateStateUseCase {
  constructor(private senateStateRepo: ISenateStateRepository) {}

  async execute(input: UpdateSenateStateInput): Promise<SenateState> {
    if (input.liveTopic !== undefined && input.liveTopic.trim().length < 3) {
      throw new Error("El tema del debate debe tener al menos 3 caracteres");
    }
    return this.senateStateRepo.update(input);
  }
}