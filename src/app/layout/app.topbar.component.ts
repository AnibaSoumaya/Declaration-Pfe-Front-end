import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { LoginService } from '../core/services/login.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {
    items!: MenuItem[];
    profileMenuVisible: boolean = false;
    
    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;
    
    constructor(
        public layoutService: LayoutService,
        public loginService: LoginService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}
    
    nomPrenom: string = '';
    
    ngOnInit() {
        // Vérification que les données sont bien présentes dans le localStorage
        const nom = this.loginService.getUserNom();
        const prenom = this.loginService.getUserPrenom();
        console.log('Nom:', nom);
        console.log('Prenom:', prenom);
        
        // Mise à jour de nomPrenom
        this.nomPrenom = `${prenom ?? ''} ${nom ?? ''}`.trim();
        console.log('pp', this.nomPrenom);
        
        // Forcer Angular à détecter les changements et mettre à jour la vue
        this.cdr.detectChanges();
    }
    
    // Nouvelle fonction pour basculer l'affichage du menu de profil
    toggleProfileMenu(event: Event) {
        this.profileMenuVisible = !this.profileMenuVisible;
        event.stopPropagation(); // Empêche la propagation du clic pour éviter que le document:click ferme immédiatement
    }
    
    // Fermer le menu de profil
    closeProfileMenu() {
        this.profileMenuVisible = false;
        this.router.navigate(['/profil']);

    }
    
    // Fermer le menu quand on clique ailleurs sur la page
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (this.profileMenuVisible) {
            // Rechercher le menu popup et le bouton de profil
            const profileMenu = document.querySelector('.layout-topbar-menu > div > div');
            const profileButton = document.querySelector('.layout-topbar-menu > div > button');
            
            // Si le clic n'est ni sur le menu ni sur le bouton, fermer le menu
            if (profileMenu && profileButton && 
                !profileMenu.contains(event.target as Node) && 
                !profileButton.contains(event.target as Node)) {
                this.closeProfileMenu();
                this.cdr.detectChanges(); // Forcer la mise à jour de la vue
            }
        }
    }
    
    logout() {
        this.loginService.logoutFromServer().subscribe({
            next: () => {
                this.loginService.logout(); // Supprimer localStorage
                this.router.navigate(['/securite']); // Redirection après déconnexion
            },
            error: (err) => {
                console.error('Erreur lors de la déconnexion', err);
                // Même en cas d'erreur, on supprime les données locales
                this.loginService.logout();
                this.router.navigate(['/securite']);
            }
        });
    }
}