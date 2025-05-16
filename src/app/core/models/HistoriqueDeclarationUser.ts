import { Declaration } from "./declaration";
import { User } from "./User.model";

export class HistoriqueDeclarationUser {
  id: number;
  dateAffectation:Date 
  dateFinAffectation?: Date
  declaration: Declaration
  utilisateur:User
}