// statistics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private baseUrl = 'http://localhost:8084/api/statistics';

  constructor(private http: HttpClient) { }

  // ===============================
  // STATISTIQUES ADMINISTRATEUR
  // ===============================
  
  getStatsForAdmin(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin-stats`);
  }

  getTotalDeclarations(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/total-declarations`);
  }

  getStatsByUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats-by-user`);
  }

  getStatsByEtat(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats-by-etat`);
  }

  getStatsByPeriode(period: string = 'monthly'): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats-by-period?period=${period}`);
  }

  getPerformanceUtilisateurs(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/user-performance`);
  }

  getWorkflowStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/workflow-stats`);
  }

  getAmendeStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/amende-stats`);
  }

  // ===============================
  // STATISTIQUES PROCUREUR GÉNÉRAL
  // ===============================

  getStatsForProcureurGeneral(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/procureur-stats`);
  }

  getReportsByType(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports-by-type`);
  }

  getDecisionStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/decisions`);
  }

  getDeclarationsByActor(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/declarations-by-actor`);
  }

  getDeclarationsTrend(period: string = 'monthly'): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/declarations-trend?period=${period}`);
  }

  getStatsByDeclarationType(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats-by-declaration-type`);
  }

  // ===============================
  // STATISTIQUES CONSEILLER RAPPORTEUR
  // ===============================

  getStatsForConseillerRapporteur(utilisateurId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/conseiller-stats/${utilisateurId}`);
  }

  // ===============================
  // STATISTIQUES AVOCAT GÉNÉRAL
  // ===============================

  getStatsForAvocatGeneral(utilisateurId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/avocat-stats/${utilisateurId}`);
  }
}