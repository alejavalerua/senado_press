export interface Senator {
  id: string;
  fullName: string;
  party: string;
  caucus: string | null;
  photoUrl: string | null;
  isActive: boolean;
}