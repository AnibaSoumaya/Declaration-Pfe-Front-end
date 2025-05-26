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
        const isAdmin = this.currentUser?.role === 'administrateur'; // Adjust based on your role property name
        
        this.model = [
            {
                label: 'Pfe',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
                    
                    // Admin-only items
                    ...(isAdmin ? [
                        { label: 'Gestion des assujettis', icon: 'pi pi-fw pi-user', routerLink: ['/Assujetti'] },
                        { label: 'Gestion des utilisateurs', icon: 'pi pi-fw pi-users', routerLink: ['/utilisateur'] },
                        {
                            label: 'Paramétrage',
                            icon: 'pi pi-wrench',
                            items: [
                                {
                                    label: 'Vocabulaire',
                                    icon: 'pi pi-language',
                                    routerLink: ['/vocabulaire']
                                },
                                {
                                    label: 'Paramètres',
                                    icon: 'pi pi-cog',
                                    routerLink: ['/parametres']
                                },
                            ]
                        }
                    ] : []),
                    
                    // Items visible to all users
                    { label: 'Declarations Assujettis', icon: 'pi pi-fw pi-user', routerLink: ['Assujetti/decDetails'] },
                    { label: 'Profil', icon: 'pi pi-fw pi-users', routerLink: ['/profil'] },
                    { label: 'BI', icon: 'pi pi-fw pi-user', routerLink: ['/Assujetti/BI'] },
                    { label: 'Historique', icon: 'pi pi-history', routerLink: ['/historique'] },                    
                ]
            }
        ];
    }
}