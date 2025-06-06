import { Declaration } from "./declaration";
import { Vocabulaire } from "./Vocabulaire.model";

export interface Vehicule {
    id?: number;
    designation: Vocabulaire;
    marque: Vocabulaire;
    carburant: Vocabulaire;
    transmission: Vocabulaire;
    kilometrage: number;
    immatriculation: string;
    anneeAcquisition: number;
    valeurAcquisition: number;
    etatGeneral: Vocabulaire;
    dateCreation: string; 
    isSynthese: boolean;
    idDeclaration: Declaration;
    isEdit: boolean;  

  }