import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Rapport } from '../models/rapport';

@Injectable({
  providedIn: 'root'
})
export class RapportService {

  private apiUrl = `http://localhost:8084/api/rapports`;

  constructor(private http: HttpClient) {}

  genererProvisoire(utilisateurId: number, declarationId: number, contenu: string): Observable<Rapport> {
    const params = new HttpParams()
      .set('utilisateurId', utilisateurId)
      .set('declarationId', declarationId);
    return this.http.post<Rapport>(`${this.apiUrl}/provisoire`, contenu, { params });
  }

  genererDefinitif(utilisateurId: number, declarationId: number, decision: boolean, contenu: string): Observable<Rapport> {
    const params = new HttpParams()
      .set('utilisateurId', utilisateurId)
      .set('declarationId', declarationId)
      .set('decision', decision);
    return this.http.post<Rapport>(`${this.apiUrl}/definitif`, contenu, { params });
  }

  telecharger(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/telecharger/${id}`, { responseType: 'blob' });
  }

  getByDeclaration(declarationId: number): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(`${this.apiUrl}/declaration/${declarationId}`);
  }

  getByUtilisateur(utilisateurId: number): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(`${this.apiUrl}/utilisateur/${utilisateurId}`);
  }

  getByType(type: string): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(`${this.apiUrl}/type/${type}`);
  }

  getById(id: number): Observable<Rapport> {
    return this.http.get<Rapport>(`${this.apiUrl}/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
