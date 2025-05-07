import { Assujetti } from "./Assujetti.model";
import { TypeDeclaration } from "./typedeclaration";
import { User } from "./User.model";

export class Declaration {
    id?: number;
    dateDeclaration?: Date;
    dateValidation?: Date;
    typeDeclaration?: TypeDeclaration;
    etatDeclaration?: string;
    assujetti?: Assujetti;
    salaireMensuel?: number;
    numeroDeclaration?: number;
    numeroRapportProvisoir?: string;
    datePlanificationDelibere?: Date;
    utilisateur?: User;

}