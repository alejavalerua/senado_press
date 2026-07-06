import { Senator } from "@/domain/entities/Senator";
import { ISenatorRepository, CreateSenatorInput, UpdateSenatorInput } from "@/domain/repositories/ISenatorRepository";

export class ManageSenatorUseCase {
  constructor(private senatorRepo: ISenatorRepository) {}

  async create(input: CreateSenatorInput): Promise<Senator> {
    if (!input.fullName.trim() || !input.party.trim()) {
      throw new Error("Nombre y partido son obligatorios");
    }
    return this.senatorRepo.create({
      fullName: input.fullName.trim(),
      party: input.party.trim(),
      caucus: input.caucus?.trim() || null,
      photoUrl: input.photoUrl ?? null,
    });
  }

  async update(id: string, input: UpdateSenatorInput): Promise<Senator> {
    const senator = await this.senatorRepo.findById(id);
    if (!senator) throw new Error("Senador no encontrado");
    return this.senatorRepo.update(id, input);
  }

  async delete(id: string): Promise<void> {
    const senator = await this.senatorRepo.findById(id);
    if (!senator) throw new Error("Senador no encontrado");
    await this.senatorRepo.delete(id);
  }
}