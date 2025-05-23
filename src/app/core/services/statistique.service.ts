import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private baseUrl = 'http://localhost:8084/api';  // Ajustez selon votre configuration

  constructor(private http: HttpClient) { }

  // Récupérer le nombre total de déclarations
  getTotalDeclarations(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/statistics/total-declarations`);
  }

  // Récupérer le nombre de rapports générés par type (provisoires/définitifs)
  getReportsByType(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/statistics/reports-by-type`);
  }

  // Récupérer le nombre de déclarations acceptées/refusées
  getDecisionStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/statistics/decisions`);
  }

  // Récupérer le nombre de déclarations traitées par type d'acteur
  getDeclarationsByActor(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/statistics/declarations-by-actor`);
  }

  // Récupérer l'évolution des dépôts par mois ou trimestre
  getDeclarationsTrend(period: 'monthly' | 'quarterly'): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/statistics/declarations-trend?period=${period}`);
  }

  // Récupérer les statistiques par utilisateur ou par type de déclaration
  getStatsByUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/statistics/stats-by-user`);
  }

  getStatsByDeclarationType(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/statistics/stats-by-declaration-type`);
  }
}