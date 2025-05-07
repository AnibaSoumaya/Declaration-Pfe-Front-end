import { Declaration } from './declaration';
import { Vocabulaire } from './Vocabulaire.model';

export class MeubleMeublant {
    isSelected: boolean;
    id?: number;
    designation?: string; 
    anneeAcquisition?: Date; 
    valeurAcquisition?: number; 
    etatGeneral?: Vocabulaire; 
    dateCreation?: Date; 
    declaration?: Declaration; 
    isEdit: boolean; 
}

