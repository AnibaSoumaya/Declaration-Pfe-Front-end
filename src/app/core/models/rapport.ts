import { Declaration } from "./declaration";
import { User } from "./User.model";

export interface Rapport {
  id: number;
  type: 'PROVISOIRE' | 'DEFINITIF';
  reference: string;
  contenuPdf: Uint8Array; // ou Blob si tu veux gérer le PDF côté client
  nomFichier: string;
  dateCreation: string; // ISO string, ex : "2025-05-13T12:00:00"
  declaration: Declaration
  utilisateur:User;
  decision?: boolean; // facultatif, seulement pour les rapports définitifs
  tailleFichier: number;
}
