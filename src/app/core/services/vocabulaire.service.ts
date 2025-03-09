import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { TypeVocabulaire } from '../models/TypeVocabulaire.model';
import { Vocabulaire } from '../models/Vocabulaire.model';

@Injectable({
  providedIn: 'root'
})
export class VocabulaireService {

  private baseUrl: string = 'http://localhost:8084/api/vocabulaire'; 
  private baseUrl2: string = 'http://localhost:8084/api/type-vocabulaire';  // URL pour obtenir les types de vocabulaire

  constructor(private http: HttpClient) {}


  getAllVocabulaire(): Observable<Vocabulaire[]> {
    return this.http.get<Vocabulaire[]>(this.baseUrl); // Appel de l'API backend pour récupérer la liste
  }
  // Obtenir la liste des types de vocabulaire
  getTypesVocabulaire(): Observable<TypeVocabulaire[]> {
    return this.http.get<TypeVocabulaire[]>(this.baseUrl2); // Utilisation de la bonne URL
  }

  // Obtenir le vocabulaire pour un type donné
  getVocabulaireByType(typeId: number): Observable<Vocabulaire[]> {
    return this.http.get<Vocabulaire[]>(`${this.baseUrl}/type/${typeId}`);
  }

  // Désactiver un vocabulaire
  disableVocabulaire(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/disable`, {});
  }

  // Activer un vocabulaire
  enableVocabulaire(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/enable`, {});
  }

  


     // Méthode pour créer un vocabulaire
  createVocabulaire(vocabulaire: Vocabulaire): Observable<Vocabulaire> {
    const headers = this.getAuthHeaders(); // Si vous utilisez un token JWT pour l'authentification
    return this.http.post<Vocabulaire>(this.baseUrl, vocabulaire, { headers })
      .pipe(catchError(this.handleError));
  }

  searchVocabulaire(query: string): Observable<Vocabulaire[]> {
    return this.http.get<Vocabulaire[]>(`${this.baseUrl}/search?intitule=${query}`,{ headers: this.getAuthHeaders() }).pipe(catchError(this.handleError));;
  }


  

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found!');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  

  private handleError(error: any) {
    console.error('Error:', error);
    return throwError(() => new Error(error.message || 'An unknown error occurred.'));
  }
}
