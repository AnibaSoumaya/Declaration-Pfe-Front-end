import { Declaration } from "./declaration";
import { Vocabulaire } from "./Vocabulaire.model";



export class Animaux{
    isSelected: boolean;
    id?: number;
    espece?: string;
    race?: string;
    nombreTetes?: number;
    modeAcquisition?: Vocabulaire;
    anneeAcquisition?: Date;
    valeurAcquisition?: number;
    localite?: string;
    dateCreation?: string;
    declaration?: Declaration;
    isEdit: boolean;

    fileName?: string;
    fileType?: string;
    fileDownloadUri?: string;
    fileData?: Blob;
}
