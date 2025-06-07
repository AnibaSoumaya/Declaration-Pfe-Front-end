import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
// Updated Service with better error handling
export class PgstatService {
  private baseUrl = 'http://localhost:8084/api/pg/statistics';
  
  constructor(private http: HttpClient) {}

  getDeclarationStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/declarations`).pipe(
      catchError(this.handleError)
    );
  }

  getReportStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports`).pipe(
      catchError(this.handleError)
    );
  }

  getDecisionStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/decisions`).pipe(
      catchError(this.handleError)
    );
  }

  getAdvisorsPerformance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/advisors-performance`).pipe(
      catchError(this.handleError)
    );
  }

  getTemporalStats(period: string = 'monthly'): Observable<any> {
    return this.http.get(`${this.baseUrl}/temporal`, {
      params: { period }
    }).pipe(
      catchError(this.handleError)
    );
  }

  getWorkflowStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/workflow`).pipe(
      catchError(this.handleError)
    );
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    console.error('API Error:', error);
    
    // Return empty data structure instead of throwing error
    return of({
      declarations: { total: 0, initiales: 0, misesAJour: 0 },
      reports: { rapportsProvisoires: 0, rapportsDefinitifs: 0, rapportsEnRetard: 0 },
      decisions: { declarationsAcceptees: 0, declarationsRefusees: 0 },
      workflow: { nouveauxDossiers: 0, dossiersEnCours: 0, dossiersTermines: 0 },
      advisorsPerformance: []
    });
  }
  getStatsMensuellesPG(pgId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/stats-mensuelles/${pgId}`);
  }

  // Méthode pour les charges de travail détaillées
  getDetailedWorkloads(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/detailed-workloads`);
  }
  
}