import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConseillerStatisticsService {
  private baseUrl = 'http://localhost:8084/api/conseiller-statistics';

  constructor(private http: HttpClient) { }

  // Main dashboard data
  getDashboardConseiller(conseillerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${conseillerId}/dashboard`);
  }

  // Individual statistics methods
  getStatistiquesConseiller(conseillerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${conseillerId}`);
  }

  consulterDeclarationsAssignees(conseillerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${conseillerId}/declarations`);
  }

  genererRapportProvisoire(conseillerId: number, declarationId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${conseillerId}/rapport-provisoire/${declarationId}`, {});
  }

  verifierDeclaration(conseillerId: number, declarationId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${conseillerId}/verifier-fraude/${declarationId}`, {});
  }

  getStatistiquesMensuelles(conseillerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${conseillerId}/stats-mensuelles`);
  }



  getPerformanceVerification(conseillerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${conseillerId}/performance`);
  }


  // New methods for additional statistics
  getChargeUtilisateur(conseillerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${conseillerId}/charge-travail`);
  }

  getPerformanceAnnuelle(conseillerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${conseillerId}/performance-annuelle`);
  }

  getDeclarationsAnciennes(conseillerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${conseillerId}/declarations-anciennes`);
  }


}