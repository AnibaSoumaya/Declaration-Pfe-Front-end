import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Notification } from 'src/app/core/models/Notification';
import { NotificationService } from 'src/app/core/services/notification.service';
import { LoginService } from 'src/app/core/services/login.service';

@Component({
  selector: 'app-notification-panel',
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss']
})
export class NotificationPanelComponent implements OnInit {
  @Input() visible = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onCountChange = new EventEmitter<number>();
 
  notifications: Notification[] = [];
  unreadCount = 0;
  userId: number;

  constructor(
    private notificationService: NotificationService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.userId = Number(this.loginService.getUserId());
  }

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    this.notificationService.loadUserNotifications(this.userId).subscribe();
  }

  /*loadNotifications(): void {
    this.notificationService.getUserNotifications(this.userId).subscribe({
      error: (err) => console.error('Error loading notifications', err)
    });
  }*/

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount(this.userId).subscribe({
      next: (count) => {
        this.unreadCount = count;
        this.onCountChange.emit(count);
      },
      error: (err) => console.error('Error loading unread count', err)
    });
  }

  private updateUnreadCount(): void {
    const count = this.notifications.filter(n => !n.isRead).length;
    this.unreadCount = count;
    this.onCountChange.emit(count);
  }
  
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
    
    if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return rtf.format(-diffInMinutes, 'minute');
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return rtf.format(-diffInHours, 'hour');
    const diffInDays = Math.floor(diffInHours / 24);
    return rtf.format(-diffInDays, 'day');
  }

    markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(notification.id).subscribe(success => {
      if (!success) {
        // Gérer l'échec si nécessaire
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead(this.userId).subscribe(success => {
      if (!success) {
        // Gérer l'échec si nécessaire
      }
    });
  }

  navigateToItem(notification: Notification): void {
    if (notification.declaration) {
      const url = `/controleDeclaration/${notification.declaration.id}`;
      console.log('etat:',notification.isRead);
      
      if (!notification.isRead) {
        this.notificationService.markAsRead(notification.id).subscribe({
          next: () => {
            this.navigateWithForceReload(url);
          },
          error: (err) => console.error('Error marking as read', err)
        });
      } else {
        this.navigateWithForceReload(url);
      }
    }
  }

  private navigateWithForceReload(url: string): void {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([url]).then(() => {
        this.onClose.emit();
      });
    });
  }

  close(): void {
    this.onClose.emit();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'ASSIGNMENT': return 'pi-tasks';
      case 'VALIDATION': return 'pi-check-circle';
      case 'REJECTION': return 'pi-times-circle';
      default: return 'pi-bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'ASSIGNMENT': return '#F57C00';
      case 'VALIDATION': return '#4CAF50';
      case 'REJECTION': return '#F44336';
      default: return '#2196F3';
    }
  }
}