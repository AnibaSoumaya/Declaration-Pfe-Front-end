import { EtatAssujettiEnum } from "./EtatAssujettiEnum";
import { User } from "./User.model";
import { Vocabulaire } from "./Vocabulaire.model";

export class Assujetti {
  id?: number;
  civilite: Vocabulaire;
  nom: string;
  prenom: string;
  contacttel: string;
  email: string;
  code: string;
  etat: EtatAssujettiEnum;
  institutions: Vocabulaire;
  administration: Vocabulaire;
  entite: Vocabulaire;
  fonction: Vocabulaire;
  matricule: string;
  datePriseDeService: Date;
  administrateur: User;
}
