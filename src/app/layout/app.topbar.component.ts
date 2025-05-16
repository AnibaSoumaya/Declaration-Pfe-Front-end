import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { LoginService } from '../core/services/login.service';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit, OnDestroy {
  items!: MenuItem[];
  profileMenuVisible: boolean = false;
  
  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') menu!: ElementRef;
  
  nomPrenom: string = '';
  role: string = '';
  userId: number;
  notificationPanelVisible: boolean = false;
  unreadNotificationsCount: number = 0;
  showNotificationHighlight: boolean = false;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    public layoutService: LayoutService,
    public loginService: LoginService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.userId = Number(this.loginService.getUserId());
}

  ngOnInit() {
    this.initUserInfo();
    this.setupNotificationPolling();
  }

  private initUserInfo(): void {
    const nom = this.loginService.getUserNom();
    const prenom = this.loginService.getUserPrenom();
    this.nomPrenom = `${prenom ?? ''} ${nom ?? ''}`.trim();
    
    this.loginService.fetchAndStoreRole();
    setTimeout(() => {
      this.role = this.loginService.getRole() ?? '';
      this.cdr.detectChanges();
    }, 500);
  }

  private setupNotificationPolling(): void {
    // Charge immédiatement le compteur
    this.fetchUnreadNotificationsCount();
    
    // Met à jour toutes les minutes
    this.subscriptions.add(
      interval(60000).subscribe(() => {
        this.fetchUnreadNotificationsCount();
      })
    );
  }

  handleNotificationClick(event: Event): void {
    event.stopPropagation();
    
    // Si le panel est fermé et qu'il y a des notifications non lues
    if (!this.notificationPanelVisible && this.unreadNotificationsCount > 0) {
      // Option 1: Marquer toutes comme lues immédiatement
      this.notificationService.markAllAsRead(this.userId).subscribe({
        next: () => {
          this.unreadNotificationsCount = 0;
          this.showNotificationHighlight = false;
          this.toggleNotificationPanel(event);
        },
        error: (err) => console.error('Error marking all as read', err)
      });
      
      // OU Option 2: Juste ouvrir le panel (marquage lors de la navigation)
      // this.toggleNotificationPanel(event);
    } else {
      // Basique: juste toggle le panel
      this.toggleNotificationPanel(event);
    }
  }

  fetchUnreadNotificationsCount(): void {
    this.notificationService.getUnreadCount(this.userId).subscribe({
      next: (count) => {
        if (count !== this.unreadNotificationsCount) {
          this.showNotificationHighlight = count > this.unreadNotificationsCount;
          this.unreadNotificationsCount = count;
          this.cdr.detectChanges();
          
          if (this.showNotificationHighlight) {
            setTimeout(() => {
              this.showNotificationHighlight = false;
              this.cdr.detectChanges();
            }, 3000);
          }
        }
      },
      error: (err) => console.error('Error fetching notifications', err)
    });
  }

  toggleNotificationPanel(event: Event): void {
    this.notificationPanelVisible = !this.notificationPanelVisible;
    event.stopPropagation();
  }

  closeNotificationPanel(): void {
    this.notificationPanelVisible = false;
    this.fetchUnreadNotificationsCount();
  }

  updateUnreadCount(count: number): void {
    this.unreadNotificationsCount = count;
    this.cdr.detectChanges();
  }

  

  closeProfileMenu(): void {
    this.profileMenuVisible = false;
    this.router.navigate(['/profil']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.handleProfileMenuClickOutside(event);
    this.handleNotificationPanelClickOutside(event);
  }

  private handleProfileMenuClickOutside(event: MouseEvent): void {
    if (!this.profileMenuVisible) return;
    
    const profileMenu = document.querySelector('.layout-topbar-menu > div > div');
    const profileButton = document.querySelector('.layout-topbar-menu > div > button');
    
    if (profileMenu && profileButton && 
        !profileMenu.contains(event.target as Node) && 
        !profileButton.contains(event.target as Node)) {
      this.closeProfileMenu();
    }
  }

  private handleNotificationPanelClickOutside(event: MouseEvent): void {
    if (!this.notificationPanelVisible) return;
    
    const notificationPanel = document.querySelector('app-notification-panel');
    const notificationButton = document.querySelector('.notification-button');
    
    if (notificationPanel && notificationButton && 
        !notificationPanel.contains(event.target as Node) && 
        !notificationButton.contains(event.target as Node)) {
      this.closeNotificationPanel();
    }
  }

  logout(): void {
    this.loginService.logoutFromServer().subscribe({
      next: () => this.handleLogoutSuccess(),
      error: (err) => this.handleLogoutError(err)
    });
  }

  private handleLogoutSuccess(): void {
    this.loginService.logout();
    this.router.navigate(['/securite']);
  }

  private handleLogoutError(err: any): void {
    console.error('Error during logout', err);
    this.loginService.logout();
    this.router.navigate(['/securite']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // 1. Ajouter cette propriété dans la classe
openSubmenu: string | null = null;

// 2. Ajouter cette méthode
toggleSubmenu(submenuName: string): void {
  if (this.openSubmenu === submenuName) {
    this.openSubmenu = null;
  } else {
    this.openSubmenu = submenuName;
  }
}

// 3. Ajouter cette méthode si elle n'existe pas déjà
navigateTo(route: string): void {
  this.profileMenuVisible = false;
  this.openSubmenu = null;
  this.router.navigate([route]);
}

// 4. Modifier la méthode toggleProfileMenu
toggleProfileMenu(event: Event): void {
  this.profileMenuVisible = !this.profileMenuVisible;
  if (!this.profileMenuVisible) {
    this.openSubmenu = null;
  }
  event.stopPropagation();
}
}