import { Component, OnDestroy, Renderer2, ViewChild, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LayoutService } from "./service/app.layout.service";
import { AppSidebarComponent } from "./app.sidebar.component";
import { AppTopBarComponent } from './app.topbar.component';
import { MenuItem } from 'primeng/api';
import { UserService } from '../core/services/user.service';
import { DeclarationService } from '../core/services/declaration.service'; // Update with correct path
import { Declaration } from '../core/models/declaration';

@Component({
    selector: 'app-layout',
    templateUrl: './app.layout.component.html'
})
export class AppLayoutComponent implements OnInit, OnDestroy {
    overlayMenuOpenSubscription: Subscription;
    menuOutsideClickListener: any;
    profileMenuOutsideClickListener: any;
    userSubscription: Subscription;
    
    // Variables pour les Steps
    routeItems: MenuItem[] = [
        { label: 'Contrôle', routerLink: '/controleDeclaration' },
        { label: 'Jugement', routerLink: '/juge' }
    ];
    activeStepIndex: number = 0;
    showStepsFlag: boolean = false;
    currentUserRole: string = '';
    currentDeclaration: Declaration | null = null; // Add declaration tracking
    currentDeclarationId: string | null = null;

    @ViewChild(AppSidebarComponent) appSidebar!: AppSidebarComponent;
    @ViewChild(AppTopBarComponent) appTopbar!: AppTopBarComponent;

    constructor(
        public layoutService: LayoutService, 
        public renderer: Renderer2, 
        public router: Router,
        private userService: UserService,
        private declarationService: DeclarationService // Add DeclarationService injection
    ) {
        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', event => {
                    const isOutsideClicked = !(this.appSidebar.el.nativeElement.isSameNode(event.target) || this.appSidebar.el.nativeElement.contains(event.target) 
                        || this.appTopbar.menuButton.nativeElement.isSameNode(event.target) || this.appTopbar.menuButton.nativeElement.contains(event.target));
                    
                    if (isOutsideClicked) {
                        this.hideMenu();
                    }
                });
            }

            if (!this.profileMenuOutsideClickListener) {
                this.profileMenuOutsideClickListener = this.renderer.listen('document', 'click', event => {
                    const isOutsideClicked = !(this.appTopbar.menu.nativeElement.isSameNode(event.target) || this.appTopbar.menu.nativeElement.contains(event.target)
                        || this.appTopbar.topbarMenuButton.nativeElement.isSameNode(event.target) || this.appTopbar.topbarMenuButton.nativeElement.contains(event.target));

                    if (isOutsideClicked) {
                        this.hideProfileMenu();
                    }
                });
            }

            if (this.layoutService.state.staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });

        this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.hideMenu();
                this.hideProfileMenu();
                this.updateStepsVisibility(event.url);
            });
    }

    ngOnInit(): void {
        // Get current user and their role
        this.userSubscription = this.userService.getCurrentUser().subscribe({
            next: (user) => {
                this.currentUserRole = user.role || '';
                // Update steps visibility based on current route after getting user role
                this.updateStepsVisibility(this.router.url);
            },
            error: (error) => {
                console.error('Error fetching current user:', error);
                this.currentUserRole = '';
            }
        });
    }

    // Met à jour la visibilité et l'index actif des Steps
    updateStepsVisibility(url: string): void {
        const isRelevantRoute = url.includes('/controleDeclaration/') || url.includes('/juge/');
        
        if (!isRelevantRoute) {
            this.showStepsFlag = false;
            return;
        }

        const id = this.extractIdFromUrl(url);
        if (id) {
            this.currentDeclarationId = id;
            // Load declaration data to check state
            this.loadDeclarationData(id);
            
            this.routeItems = [
                { label: 'Déclaration details', routerLink: `/controleDeclaration/${id}` },
                { label: 'Générer Rapport', routerLink: `/juge/${id}` }
            ];
            
            // Détermine l'étape active
            this.activeStepIndex = url.includes('/controleDeclaration/') ? 0 : 1;
        }
    }

    // Load declaration data to check its state
    private loadDeclarationData(id: string): void {
        const declarationId = parseInt(id, 10);
        
        this.declarationService.getDeclarationById(declarationId).subscribe({
            next: (declaration: Declaration) => {
                this.currentDeclaration = declaration;
                console.log('Declaration loaded:', declaration);
                console.log('Declaration state:', declaration.etatDeclaration);
                this.evaluateStepsVisibility();
            },
            error: (error) => {
                console.error('Error loading declaration:', error);
                this.currentDeclaration = null;
                this.showStepsFlag = false;
            }
        });
    }

    // Evaluate whether to show steps based on role and declaration state
    private evaluateStepsVisibility(): void {
        if (!this.currentUserRole) {
            this.showStepsFlag = false;
            return;
        }

        // Check conditions for showing steps
        const shouldShowSteps = this.shouldShowStepsForRole();
        this.showStepsFlag = shouldShowSteps;
    }

    // Determine if steps should be shown based on user role and declaration state
    private shouldShowStepsForRole(): boolean {
        console.log('Checking role:', this.currentUserRole, 'Declaration:', this.currentDeclaration);
        
        switch (this.currentUserRole) {
            case 'conseiller_rapporteur':
                // Show steps only if etatDeclaration is 'en_cours'
                const shouldShow = this.currentDeclaration?.etatDeclaration === 'en_cours';
                console.log('conseiller_rapporteur - should show steps:', shouldShow);
                return shouldShow;
            
            case 'procureur_general':
                // Show steps for procureur_general with appropriate judgment state
                // You may need to add judgment state logic here
                // For now, assuming they can see steps when declaration exists
                const shouldShowPG = this.currentDeclaration.etatDeclaration === 'jugement';
                console.log('procureur_general - should show steps:', shouldShowPG);
                return shouldShowPG;
            
            case 'avocat_general':
                // Never show steps for avocat_general
                console.log('avocat_general - never show steps');
                return false;
            
            default:
                console.log('Unknown role - no steps');
                return false;
        }
    }

    // Méthode pour vérifier si on doit afficher les Steps
    showSteps(): boolean {
        return this.showStepsFlag;
    }

    // Method to update declaration state (call this when declaration state changes)
    updateDeclarationState(declaration: Declaration): void {
        this.currentDeclaration = declaration;
        this.evaluateStepsVisibility();
    }

    // Méthode pour extraire l'ID de l'URL
    private extractIdFromUrl(url: string): string | null {
        const match = url.match(/\/(controleDeclaration|juge)\/(\d+)/);
        return match ? match[2] : null;
    }

    hideMenu() {
        this.layoutService.state.overlayMenuActive = false;
        this.layoutService.state.staticMenuMobileActive = false;
        this.layoutService.state.menuHoverActive = false;
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }
        this.unblockBodyScroll();
    }

    hideProfileMenu() {
        this.layoutService.state.profileSidebarVisible = false;
        if (this.profileMenuOutsideClickListener) {
            this.profileMenuOutsideClickListener();
            this.profileMenuOutsideClickListener = null;
        }
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        }
        else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        }
        else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
                'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    get containerClass() {
        return {
            'layout-theme-light': this.layoutService.config().colorScheme === 'light',
            'layout-theme-dark': this.layoutService.config().colorScheme === 'dark',
            'layout-overlay': this.layoutService.config().menuMode === 'overlay',
            'layout-static': this.layoutService.config().menuMode === 'static',
            'layout-static-inactive': this.layoutService.state.staticMenuDesktopInactive && this.layoutService.config().menuMode === 'static',
            'layout-overlay-active': this.layoutService.state.overlayMenuActive,
            'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
            'p-input-filled': this.layoutService.config().inputStyle === 'filled',
            'p-ripple-disabled': !this.layoutService.config().ripple
        }
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }

        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }
    }
}