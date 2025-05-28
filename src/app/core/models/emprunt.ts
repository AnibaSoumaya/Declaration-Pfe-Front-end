import { Declaration } from './declaration';
import { Vocabulaire } from './Vocabulaire.model';


export class Emprunt{
    isSelected: boolean;
    id?: number;
    institutionFinanciere?: string;
    numeroCompte?: string;
    typeEmprunt?: Vocabulaire;
    montantEmprunt?: number;
    typeCompte?:Vocabulaire;
    datePremiereEcheance?:Date;
    montantRestant?:number;
    dateDernierEcheance?:Date;
    dateCreation?: Date;
    declaration?: Declaration;
    isEdit: boolean;  
    tableauAmortissement?: string;

    fileName?: string;
    fileType?: string;
    fileDownloadUri?: string;
    fileData?: Blob;
}
