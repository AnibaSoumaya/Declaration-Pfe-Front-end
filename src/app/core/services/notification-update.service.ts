import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationUpdateService {
  // BehaviorSubject pour suivre les mises à jour des notifications
  private notificationsUpdated = new BehaviorSubject<boolean>(false);
  
  constructor() { }

  // Méthode pour notifier qu'il y a eu une mise à jour des notifications
  notifyUpdate(): void {
    this.notificationsUpdated.next(true);
    // Réinitialiser après un court délai
    setTimeout(() => {
      this.notificationsUpdated.next(false);
    }, 100);
  }

  // Observable pour s'abonner aux mises à jour
  getNotificationUpdates(): Observable<boolean> {
    return this.notificationsUpdated.asObservable();
  }
}