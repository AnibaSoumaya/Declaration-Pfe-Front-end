import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConclusionService {
    private apiUrl = 'http://localhost:8084/api/conclusions';

  constructor(private http: HttpClient) { }

  // Générer une conclusion avec fichier uploadé
  genererConclusion(declarationId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/generer/${declarationId}`, formData);
  }

  // Générer une lettre officielle
  genererLettreOfficielle(utilisateurId: number, declarationId: number, contenu: string): Observable<any> {
    const formData = new FormData();
    formData.append('utilisateurId', utilisateurId.toString());
    formData.append('declarationId', declarationId.toString());
    formData.append('contenuUtilisateur', contenu);
    return this.http.post(`${this.apiUrl}/lettre/generer`, formData);
  }

  deleteConclusion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByUtilisateurAndDeclaration(utilisateurId: number, declarationId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/utilisateur/${utilisateurId}/declaration/${declarationId}`
    );
  }

  // Télécharger une conclusion
  telechargerConclusion(conclusionId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/telecharger/${conclusionId}`, {
      responseType: 'blob'
    });
  }

  // Récupérer les conclusions par déclaration
  getByDeclaration(declarationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/declaration/${declarationId}`);
  }

  // Récupérer les conclusions par utilisateur
  getByUtilisateur(utilisateurId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/utilisateur/${utilisateurId}`);
  }

  // Récupérer une conclusion par ID
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}