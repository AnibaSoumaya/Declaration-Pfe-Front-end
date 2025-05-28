import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminstatService {
  private baseUrl = 'http://localhost:8084/api/admin/statistics';

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`);
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

  getDeclarationTrends(period: string = 'MONTHLY'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.baseUrl}/declaration-trends`, { params });
  }
}
