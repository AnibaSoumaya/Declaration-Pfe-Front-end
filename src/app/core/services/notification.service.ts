import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { Notification } from '../models/Notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = 'http://localhost:8084/api/notifications';
  private notificationsCache = new Map<number, Notification>();
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Charge les notifications et met à jour le cache
  loadUserNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(notifications => {
        this.updateCache(notifications);
        this.emitNotifications();
      }),
      catchError(error => {
        console.error('Error loading notifications', error);
        return of(this.getCachedNotifications());
      })
    );
  }

  // Marquer une notification comme lue
  markAsRead(notificationId: number): Observable<boolean> {
    return this.http.post<void>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      switchMap(() => {
        this.updateNotificationReadState(notificationId, true);
        return this.getUnreadCount(Number(localStorage.getItem('userId')));
      }),
      map(() => true),
      catchError(error => {
        console.error('Error marking as read', error);
        return of(false);
      })
    );
  }

  // Marquer toutes comme lues
  markAllAsRead(userId: number): Observable<boolean> {
    return this.http.post<void>(`${this.apiUrl}/user/${userId}/read-all`, {}).pipe(
      switchMap(() => {
        this.markAllAsReadInCache();
        return this.getUnreadCount(userId);
      }),
      map(() => true),
      catchError(error => {
        console.error('Error marking all as read', error);
        return of(false);
      })
    );
  }

  // Obtenir le compte des non-lues
  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/user/${userId}/unread-count`).pipe(
      tap(count => this.unreadCountSubject.next(count)),
      catchError(error => {
        console.error('Error getting unread count', error);
        const count = Array.from(this.notificationsCache.values())
                         .filter(n => !n.isRead).length;
        return of(count);
      })
    );
  }

  // Méthodes privées de gestion du cache
  private updateCache(notifications: Notification[]): void {
    notifications.forEach(notification => {
      this.notificationsCache.set(notification.id, notification);
    });
  }

  private updateNotificationReadState(id: number, isRead: boolean): void {
    const notification = this.notificationsCache.get(id);
    if (notification) {
      notification.isRead = isRead;
      this.emitNotifications();
    }
  }

  private markAllAsReadInCache(): void {
    this.notificationsCache.forEach(notification => {
      notification.isRead = true;
    });
    this.emitNotifications();
  }

  private emitNotifications(): void {
    this.notificationsSubject.next(Array.from(this.notificationsCache.values()));
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const count = Array.from(this.notificationsCache.values())
                     .filter(n => !n.isRead).length;
    this.unreadCountSubject.next(count);
  }

  private getCachedNotifications(): Notification[] {
    return Array.from(this.notificationsCache.values());
  }
}