import { TypeVocabulaire } from "./TypeVocabulaire.model";

export class Vocabulaire {
  id?: number;
  intitule: string;
  typevocabulaire: TypeVocabulaire;
  vocabulaireParent?: Vocabulaire;
  isActive: boolean;

  
}
