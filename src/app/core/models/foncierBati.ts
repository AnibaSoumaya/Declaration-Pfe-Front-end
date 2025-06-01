import { Declaration } from './declaration';
import { Vocabulaire } from './Vocabulaire.model';


export class FoncierBati {
  isSelected: boolean;
  id?: number;
  nature?: Vocabulaire;
  anneeConstruction?: Date;
  modeAcquisition?: Vocabulaire;
  referencesCadastrales?: string;
  superficie?: number;
  localite?: string;
  localis?:Vocabulaire
  typeUsage?: Vocabulaire;
  coutAcquisitionFCFA?: number;
  coutInvestissements?: number;
  dateCreation: Date;
  declaration: Declaration;
  isEdit: boolean;

  etatGeneral?: Vocabulaire;     
  nbrChambres?: number;          
  isSynthese?: boolean;        


  fileName?: string;
  fileType?: string;
  fileDownloadUri?: string;
  fileData?: Blob;



}

