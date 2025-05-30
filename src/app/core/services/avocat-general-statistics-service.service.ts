import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvocatGeneralStatisticsService {
  private baseUrl = 'http://localhost:8084/api/avocat-general/statistics';

  constructor(private http: HttpClient) { }

  // Global statistics
  getGlobalStats(avocatGeneralId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/global/${avocatGeneralId}`);
  }

  // Conclusion statistics
  getConclusionStats(avocatGeneralId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/conclusions/${avocatGeneralId}`);
  }

  // Performance metrics
  getPerformanceMetrics(avocatGeneralId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/performance/${avocatGeneralId}`);
  }

  // Analysis by declaration type
  getAnalysisByType(avocatGeneralId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/analysis/type/${avocatGeneralId}`);
  }

  // Monthly evolution
  getMonthlyEvolution(avocatGeneralId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/evolution/monthly/${avocatGeneralId}`);
  }

  // Workload metrics
  getWorkload(avocatGeneralId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/workload/${avocatGeneralId}`);
  }

  // Performance comparison
  getPerformanceComparison(avocatGeneralId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/comparison/${avocatGeneralId}`);
  }

  // Complete dashboard
  getDashboard(avocatGeneralId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/${avocatGeneralId}`);
  }
}