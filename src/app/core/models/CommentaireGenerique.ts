import { Declaration } from "./declaration";
import { User } from "./User.model";

export class CommentaireGenerique {
    id?: number;
    commentaire: string;
    typeEntite: String;
    utilisateur: User;   
    dateComment:Date;  
    declaration: Declaration;     
  }