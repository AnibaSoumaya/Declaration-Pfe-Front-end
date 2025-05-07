import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Declaration } from '../models/declaration';
import { User } from '../models/User.model';
import { CommentaireGenerique } from '../models/CommentaireGenerique';



@Injectable({
  providedIn: 'root'
})
export class CommentaireGeneriqueService {
  private apiUrl = 'http://localhost:8084/api/commentaires';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CommentaireGenerique[]> {
    return this.http.get<CommentaireGenerique[]>(this.apiUrl);
  }

  getById(id: number): Observable<CommentaireGenerique> {
    return this.http.get<CommentaireGenerique>(`${this.apiUrl}/${id}`);
  }

  getByDeclarationAndType(declarationId: number, typeEntite: string): Observable<CommentaireGenerique[]> {
    return this.http.get<CommentaireGenerique[]>(
      `${this.apiUrl}/declaration/${declarationId}/type/${typeEntite}`
    );
  }

  getByUtilisateurAndDeclarationAndType(utilisateurId: number, declarationId: number, typeEntite: string): Observable<CommentaireGenerique[]> {
    return this.http.get<CommentaireGenerique[]>(
      `${this.apiUrl}/declaration/${declarationId}/utilisateur/${utilisateurId}/type/${typeEntite}`
    );
  }

  create(commentaire: CommentaireGenerique): Observable<CommentaireGenerique> {
    return this.http.post<CommentaireGenerique>(this.apiUrl, commentaire);
  }

  update(id: number, commentaire: CommentaireGenerique): Observable<CommentaireGenerique> {
    return this.http.put<CommentaireGenerique>(`${this.apiUrl}/${id}`, commentaire);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
