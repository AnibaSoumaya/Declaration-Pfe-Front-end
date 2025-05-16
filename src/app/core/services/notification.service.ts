import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Notification } from '../models/Notification';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = 'http://localhost:8084/api/notifications';

  constructor(private http: HttpClient) {}

  getUserNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`);
  }

  getUnreadNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}/unread`);
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/user/${userId}/read-all`, {});
  }

  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/user/${userId}/unread-count`);
  }
}