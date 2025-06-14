import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminstatService {
  private baseUrl = 'http://localhost:8084/api/admin/statistics';

  constructor(private http: HttpClient) { }
getDashboardStats(): Observable<any> {
  return this.http.get(`${this.baseUrl}/dashboard`).pipe(
    map((response: any) => {
      // Transformer la structure des données pour correspondre au frontend
      return {
        totalDeclarations: response.declarations?.totalDeclarations || 0,
        activeUsers: response.users?.activeUsers || 0,
        totalUsers: response.users?.totalUsers || 0,
        archivedUsers: response.users?.archivedUsers || 0,
        usersByRole: response.users?.usersByRole || {},
        totalAssujettis: response.assujettis?.totalAssujettis || 0,
        activeAssujettis: response.assujettis?.activeAssujettis || 0,
        archivedAssujettis: response.assujettis?.archivedAssujettis || 0,
        assujettisByEtat: response.assujettis?.byEtat || {},
        assujettisByYear: response.assujettis?.byYearOfService || {},
        totalTerms: response.vocabulary?.totalTerms || 0,
        termsByType: response.vocabulary?.termsByType || {},
        declarationsByType: response.declarations?.byType || {},
        declarationsByEtat: response.declarations?.byEtat || {},
        // Valeurs par défaut pour les propriétés attendues mais non fournies
        processRate: 0, // À calculer ou ajouter dans le backend
        avgProcessTime: 0, // À calculer ou ajouter dans le backend
        recentActivity: [] // À implémenter dans le backend
      };
    })
  );
}

  getUserStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  getUserActivityStats(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get(`${this.baseUrl}/user-activity`, { params });
  }

  getAssujettiStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/assujettis`);
  }

  getVocabularyStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/vocabulary`);
  }

  getDeclarationStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/declarations`);
  }


getMonthlyPerformance(year: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/performance/monthly/${year}`);
}

getYearlyPerformance(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/performance/yearly`);
}

getTopUsersByRole(startDate: string, endDate: string, limit: number = 5): Observable<Map<any, any[]>> {
  const params = new HttpParams()
    .set('startDate', startDate)
    .set('endDate', endDate)
    .set('limit', limit.toString());
    
  return this.http.get<Map<any, any[]>>(`${this.baseUrl}/performance/top-users`, { params });
}

getPerformanceStatistics(year: number, startDate: string, endDate: string): Observable<any> {
  const params = new HttpParams()
    .set('year', year.toString())
    .set('startDate', startDate)
    .set('endDate', endDate);
    
  return this.http.get<any>(`${this.baseUrl}/performance/complete`, { params });
}

getCurrentYearPerformance(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/performance/current-year`);
}

getCurrentTopUsers(): Observable<Map<any, any[]>> {
  return this.http.get<Map<any, any[]>>(`${this.baseUrl}/performance/current-top-users`);
}

getPerformanceDashboard(): Observable<any> {
  return this.http.get(`${this.baseUrl}/performance/dashboard`);
}
}
