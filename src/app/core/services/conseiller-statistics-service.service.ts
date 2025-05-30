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

  getRepartitionParEtat(conseillerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${conseillerId}/repartition-etat`);
  }

  getPerformanceVerification(conseillerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${conseillerId}/performance`);
  }

  // NEW METHODS - Integration with your new backend endpoints
  getDeclarationsPrioritaires(conseillerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${conseillerId}/declarations-prioritaires`);
  }

  getRepartitionParType(conseillerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${conseillerId}/repartition-type`);
  }

  getStatistiquesValidation(conseillerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${conseillerId}/stats-validation`);
  }

  getStatistiquesTousConseillers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }
}