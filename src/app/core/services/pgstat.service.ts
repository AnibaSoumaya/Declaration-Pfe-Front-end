import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PgstatService {
  private baseUrl = 'http://localhost:8084/api/pg/statistics';

  constructor(private http: HttpClient) {}

  getDeclarationStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/declarations`);
  }

  getReportStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports`);
  }

  getDecisionStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/decisions`);
  }

  getAdvisorsPerformance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/advisors-performance`);
  }

  getTemporalStats(period: string = 'monthly'): Observable<any> {
    return this.http.get(`${this.baseUrl}/temporal`, {
      params: { period }
    });
  }

  getWorkflowStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/workflow`);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`);
  }
}
