import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Assujetti } from '../models/Assujetti.model';

@Injectable({
  providedIn: 'root'
})
export class gestionAssujettiService {
  private baseUrl = 'http://localhost:8084/api/assujetti';

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');  
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllAssujettis(): Observable<Assujetti[]> {
    return this.http.get<Assujetti[]>(this.baseUrl, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  createAssujetti(assujetti: Assujetti): Observable<Assujetti> {
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

  deleteSelectedAssujettis(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/delete-multiple`, ids, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    if (error.status === 403) {
      alert('You do not have permission to access this resource.');
    }
    return throwError(error);
  }}