import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Assujetti } from '../models/Assujetti.model';
import { Vocabulaire } from '../models/Vocabulaire.model';
import { TypeVocabulaire } from '../models/TypeVocabulaire.model';

@Injectable({
  providedIn: 'root'
})
export class gestionAssujettiService {
  private baseUrl = 'http://localhost:8084/api/assujetti';
  private baseUrl2: string = 'http://localhost:8084/api'; 



  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');  
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getVocabulaireByType(typeId: number): Observable<Vocabulaire[]> {
    return this.http.get<Vocabulaire[]>(`${this.baseUrl2}/vocabulaire/type/${typeId}`, { headers: this.getAuthHeaders() });
  }
  
  // méthode pour obtenir le vocabulaire selon l'id du type
getVocabulaireByTypeId(typeId: number): Observable<Vocabulaire[]> {
  return this.http.get<Vocabulaire[]>(`${this.baseUrl2}/vocabulaire/type/${typeId}`, { headers: this.getAuthHeaders() })
    .pipe(catchError(this.handleError));
}

  // Obtenir la liste des types de vocabulaire
  getTypesVocabulaire(): Observable<TypeVocabulaire[]> {
    return this.http.get<TypeVocabulaire[]>(`${this.baseUrl2}/type-vocabulaire`); // Utilisation de la bonne URL
  }
  getAllAssujettis(): Observable<Assujetti[]> {
    
    return this.http.get<Assujetti[]>(this.baseUrl, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }
  

  createAssujetti(assujetti: Assujetti): Observable<Assujetti> {
    console.log(assujetti);
    console.log('Données envoyées :', JSON.stringify(assujetti, null, 2));
    return this.http.post<Assujetti>(this.baseUrl, assujetti, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateAssujetti(id: number, assujetti: Assujetti): Observable<Assujetti> {
    return this.http.put<Assujetti>(`${this.baseUrl}/${id}`, assujetti, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteAssujetti(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  /*deleteSelectedAssujettis(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/delete-multiple`, ids, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }*/

  archiveAssujetti(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, {});  // Assure-toi que l'API prend en charge cette route
  }
      

  private handleError(error: any) {
    if (error.status === 403) {
      alert('You do not have permission to access this resource.');
    }
    return throwError(error);
  }}