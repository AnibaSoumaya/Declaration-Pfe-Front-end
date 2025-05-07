import { Declaration } from "./declaration";
import { Vocabulaire } from "./Vocabulaire.model";




export class DisponibiliteEnBanque {
    isSelected: boolean;
    id?: number;
    banque?: string;
    localite?: string;
    numeroCompte?: string;
    typeCompte?: Vocabulaire;
    soldeFCFA?: number;
    dateSolde?: Date;
    dateCreation?: Date;
    declaration?: Declaration;
    isEdit: boolean;
    attestationSoldeCompte?: string;

}
