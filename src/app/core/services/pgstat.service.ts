import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PgstatService {
  private baseUrl = 'http://localhost:8084/api/pg/statistics';
 
  constructor(private http: HttpClient) {}

  // Méthodes existantes
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

  // Nouvelles méthodes ajoutées
  
  /**
   * Récupère la charge de travail d'un utilisateur spécifique
   */
  getUserWorkload(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/workload/user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les statistiques mensuelles pour une année donnée
   */
  getMonthlyStats(year?: number): Observable<any> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get(`${this.baseUrl}/temporal/monthly`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les statistiques annuelles
   */
  getYearlyStats(startYear?: number, endYear?: number): Observable<any> {
    let params = new HttpParams();
    if (startYear) {
      params = params.set('startYear', startYear.toString());
    }
    if (endYear) {
      params = params.set('endYear', endYear.toString());
    }

    return this.http.get(`${this.baseUrl}/temporal/yearly`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère le dashboard complet avec toutes les statistiques
   */
  getCompleteDashboard(year?: number): Observable<any> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get(`${this.baseUrl}/dashboard/complete`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Méthodes utilitaires pour les statistiques temporelles
   */
  getCurrentYearStats(): Observable<any> {
    const currentYear = new Date().getFullYear();
    return this.getMonthlyStats(currentYear);
  }

  getLastFiveYearsStats(): Observable<any> {
    const currentYear = new Date().getFullYear();
    return this.getYearlyStats(currentYear - 4, currentYear);
  }

  /**
   * Gestion des erreurs améliorée
   */
  private handleError(error: HttpErrorResponse): Observable<any> {
    console.error('API Error:', error);
    
    // Log détaillé pour le débogage
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      console.error('Client Error:', error.error.message);
    } else {
      // Erreur côté serveur
      console.error(`Server Error: ${error.status}, Body: ${error.error}`);
    }

    // Structure de données par défaut selon le type d'endpoint
    const defaultResponse = this.getDefaultResponse(error.url);
    return of(defaultResponse);
  }

  /**
   * Retourne une structure de données par défaut selon l'endpoint
   */
  private getDefaultResponse(url?: string): any {
    if (!url) return {};

    if (url.includes('/workload/user/')) {
      return {
        userId: 0,
        userFullName: 'Utilisateur inconnu',
        userEmail: '',
        userRole: '',
        declarationsEnCours: 0,
        declarationsNouvelles: 0,
        declarationsEnAttente: 0,
        declarationsTraiteesThisMois: 0,
        declarationsTraiteesThisYear: 0,
        tauxReussiteThisMois: 0,
        tauxReussiteThisYear: 0,
        scoreCharge: 0,
        niveauCharge: 'FAIBLE'
      };
    }

    if (url.includes('/temporal/monthly')) {
      return Array.from({ length: 12 }, (_, i) => ({
        periode: i + 1,
        libellePeriode: `${(i + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`,
        totalDeclarations: 0,
        declarationsValidees: 0,
        declarationsRefusees: 0,
        tauxValidation: 0,
        tempsMoyenTraitement: 0,
        repartitionParType: {},
        repartitionParUtilisateur: {}
      }));
    }

    if (url.includes('/temporal/yearly')) {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 5 }, (_, i) => ({
        periode: currentYear - 4 + i,
        libellePeriode: (currentYear - 4 + i).toString(),
        totalDeclarations: 0,
        declarationsValidees: 0,
        declarationsRefusees: 0,
        tauxValidation: 0,
        tempsMoyenTraitement: 0,
        repartitionParType: {},
        repartitionParUtilisateur: {}
      }));
    }

    if (url.includes('/dashboard/complete')) {
      return {
        monthlyStats: [],
        yearlyStats: [],
        workloadStats: []
      };
    }

    // Structure par défaut pour le dashboard normal
    return {
      declarations: { total: 0, initiales: 0, misesAJour: 0 },
      reports: { rapportsProvisoires: 0, rapportsDefinitifs: 0, rapportsEnRetard: 0 },
      decisions: { declarationsAcceptees: 0, declarationsRefusees: 0 },
      workflow: { nouveauxDossiers: 0, dossiersEnCours: 0, dossiersTermines: 0 },
      advisorsPerformance: []
    };
  }
}