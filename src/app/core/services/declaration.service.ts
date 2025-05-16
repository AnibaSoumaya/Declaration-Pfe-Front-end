import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Declaration } from '../models/declaration';
import { HistoriqueDeclarationUser } from '../models/HistoriqueDeclarationUser';
import { User } from '../models/User.model';

@Injectable({
  providedIn: 'root'
})
export class DeclarationService {

  private apiUrl = 'http://localhost:8084/api/declarations'; 
  private apiUrl2 = 'http://localhost:8084/api/historique-declaration'; 


  constructor(private http: HttpClient) { }

  
 getFirstUtilisateurByRoleAndDeclaration(declarationId: number, role: string): Observable<User | null> {
  const url = `${this.apiUrl2}/declaration/${declarationId}/role/${role}/utilisateur`;
  console.log('Appel GET URL :', url);

  return this.http.get<User>(url).pipe(
    catchError((error) => {
      console.error('Erreur HTTP (PG):', error);
      return of(null);
    })
  );
}


  getAllDeclarations(): Observable<Declaration[]> {
    return this.http.get<Declaration[]>(`${this.apiUrl}`);
  }

  getDeclarationsByUser(userId: number): Observable<Declaration[]> {
    console.log(userId);
    const url = `${this.apiUrl}/user/${userId}/declarations`;
    return this.http.get<Declaration[]>(url).pipe(
      catchError(error => {
        console.error('Erreur API:', error);
        return of([]); // Retourne un tableau vide en cas d'erreur
      }),
      map(response => response || []) // Convertit null en tableau vide
    );
  }


  // declaration.service.ts
  searchDeclarationsByUser(keyword: string, userId: number): Observable<Declaration[]> {
    const url = `${this.apiUrl}/search1?q=${keyword}&userId=${userId}`;
    return this.http.get<Declaration[]>(url);
  }
  
  
  getDeclarationDetails(id: number): Observable<Declaration> {
    return this.http.get<Declaration>(`${this.apiUrl}/${id}/details`);
  }
  

  generatePdf(id: number): Observable<Blob> {
    const url = `${this.apiUrl}/${id}/generate-pdf`;
    return this.http.get(url, { responseType: 'blob' }); // Important: 'blob' pour recevoir un fichier binaire
  }
  
  assignGerantToDeclaration(declarationId: number, gerantId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${declarationId}/assign-user/${gerantId}`, {});
  }


  searchDeclarations(keyword: string): Observable<Declaration[]> {
    return this.http.get<Declaration[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }
  
  
}
