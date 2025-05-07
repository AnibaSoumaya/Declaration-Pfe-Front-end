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

  private getAuthHeaders() 
  {
    const token = localStorage.getItem('authToken');  
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    });
  }

  getVocabulaireByType(typeId: number): Observable<Vocabulaire[]> {
    return this.http.get<Vocabulaire[]>(`${this.baseUrl2}/vocabulaire/type/${typeId}`, { headers: this.getAuthHeaders() });
  }
    

  getVocabulaireByTypeId(typeId: number): Observable<Vocabulaire[]> {
    return this.http.get<Vocabulaire[]>(`${this.baseUrl2}/vocabulaire/type/${typeId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }


  getTypesVocabulaire(): Observable<TypeVocabulaire[]> {
      return this.http.get<TypeVocabulaire[]>(`${this.baseUrl2}/type-vocabulaire`); // Utilisation de la bonne URL
    }
    getAllAssujettis(): Observable<Assujetti[]> {
      
      return this.http.get<Assujetti[]>(this.baseUrl, { headers: this.getAuthHeaders() })
        .pipe(
          catchError(this.handleError)
        );
    }
    

  createAssujetti(assujetti: Assujetti): Observable<Assujetti> 
  {
    console.log(assujetti);
    console.log('Données envoyées :', JSON.stringify(assujetti, null, 2));
    return this.http.post<Assujetti>(this.baseUrl, assujetti, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateAssujetti(id: number, assujetti: Assujetti): Observable<Assujetti> 
  {
    return this.http.put<Assujetti>(`${this.baseUrl}/${id}`, assujetti, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteAssujetti(id: number): Observable<void> 
  {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

    /*deleteSelectedAssujettis(ids: number[]): Observable<void> {
      return this.http.post<void>(`${this.baseUrl}/delete-multiple`, ids, { headers: this.getAuthHeaders() })
        .pipe(catchError(this.handleError));
    }*/

  getAllStopped(): Observable<Assujetti[]> {
    return this.http.get<Assujetti[]>(`${this.baseUrl}/stopped`);
  }      
        

  archiveAssujetti(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/archiver`, {}, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
        
// Méthode pour restaurer un assujetti archivé
// À ajouter dans la classe gestionAssujettiService
restoreAssujetti(id: number): Observable<any> {
  return this.http.put<any>(`${this.baseUrl}/restore/${id}`, {});
}
  
  /*  private handleError(error: any) 
  {
    if (error.status === 403) 
    {
      alert('You do not have permission to access this resource.');
    }
    return throwError(error);
  }  */

    private handleError(error: any) {
      console.error('Erreur détaillée :', error);
             
      if (error.status === 403) {
        alert('You do not have permission to access this resource.');
      } else {
        console.error('Erreur générée :', error);
      }
             
      // Pour les erreurs 400 (Bad Request), renvoyer l'erreur originale
      if (error.status === 400) {
        return throwError(() => error);
      }
             
      // Pour les autres erreurs, continuer avec la transformation actuelle
      return throwError(() => new Error(error.message || 'An unknown error occurred.'));
    }
  

}