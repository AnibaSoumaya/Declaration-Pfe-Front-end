import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { User } from '../core/models/User.model';
import { UserService } from '../core/services/user.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];
    currentUser: User | null = null;

    constructor(
        public layoutService: LayoutService,
        private userService: UserService
    ) { }

    ngOnInit() {
        this.loadCurrentUser();
    }

    loadCurrentUser() {
        this.userService.getCurrentUser().subscribe({
            next: (user) => {
                this.currentUser = user;
                this.buildMenu();
            },
            error: (err) => {
                console.error('Failed to load current user', err);
                this.buildMenu(); // Build menu even if user load fails (with restricted access)
            }
        });
    }

    buildMenu() {
        const isAdmin = this.currentUser?.role === 'administrateur';
        const userRole = this.currentUser?.role;
        
        // Déterminer quelle page de statistiques afficher en fonction du rôle
        let roleSpecificStatItem = [];
        
        if (userRole === 'avocat_general') {
            roleSpecificStatItem = [
                { label: 'Statistiques', icon: 'pi pi-fw pi-chart-bar', routerLink: ['Assujetti/statistiqueAG'] }
            ];
        } else if (userRole === 'procureur_general') {
            roleSpecificStatItem = [
                { label: 'Statistiques', icon: 'pi pi-fw pi-chart-bar', routerLink: ['Assujetti/statistiquePG'] }
            ];
        } else if (userRole === 'conseiller_rapporteur') {
            roleSpecificStatItem = [
                { label: 'Statistiques', icon: 'pi pi-fw pi-chart-bar', routerLink: ['Assujetti/statistiqueCR'] }
            ];
        }
        
        this.model = [
            {
                label: 'CDB NIGER',
                items: [
                    //{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/Assujetti/conseillerstat'] },
                    
                    // Admin-only items
                    ...(isAdmin ? [
                        { label: 'Statistiques', icon: 'pi pi-fw pi-chart-bar', routerLink: ['Assujetti/statistiqueA'] },
                        //{ label: 'AdminStat', icon: 'pi pi-fw pi-chart-line', routerLink: ['/Assujetti/AdminStat'] },
                        { label: 'Gestion des assujettis', icon: 'pi pi-fw pi-user', routerLink: ['/Assujetti'] },
                        { label: 'Gestion des utilisateurs', icon: 'pi pi-fw pi-users', routerLink: ['/utilisateur'] },
                        {
                            label: 'Paramétrage',
                            icon: 'pi pi-wrench',
                            routerLink: ['/vocabulaire']
                        }
                    ] : []),

                    // Afficher seulement la statistique correspondante au rôle
                    ...roleSpecificStatItem,
                    // Items visible to all users
                    { label: 'Declarations Assujettis', icon: 'pi pi-fw pi-file', routerLink: ['Assujetti/details-declaration'] },
                    { label: 'Profil', icon: 'pi pi-fw pi-user', routerLink: ['/profil'] },
                    
                    

                    { label: 'Historique', icon: 'pi pi-history', routerLink: ['/historique'] },                    
                ]
            }
        ];
    }
}