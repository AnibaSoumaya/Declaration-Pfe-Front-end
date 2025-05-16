import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { GestionUtilisateurComponent } from './core/pages/securite/gestion-utilisateur/gestion-utilisateur.component';
import { VocabulaireComponent } from './core/pages/parametrage/vocabulaire/vocabulaire.component';
import { ParametreGenerauxComponent } from './core/pages/parametrage/parametre-generaux/parametre-generaux.component';
import { DeclarationDetailsComponent } from './core/pages/gestionSaisDeclaration/declaration-details/declaration-details.component';
import { ProfilComponent } from './core/pages/securite/profil/profil.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ControleDeclarationComponent } from './core/pages/gestionSaisDeclaration/controle-declaration/controle-declaration.component';
import { JugementComponent } from './core/pages/gestionSaisDeclaration/jugement/jugement.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            // Redirection par défaut vers la page de login
            { path: '', redirectTo: 'securite', pathMatch: 'full' },
            
            // Routes protégées par AuthGuard
            {
                path: '', 
                component: AppLayoutComponent,
                canActivate: [AuthGuard], // Protection de toutes les routes du layout principal
                children: [
                    { path: 'dashboard', loadChildren: () => import('./demo/components/dashboard/dashboard.module').then(m => m.DashboardModule) },
                    { path: 'uikit', loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UIkitModule) },
                    { path: 'utilities', loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule) },
                    { path: 'documentation', loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule) },
                    { path: 'blocks', loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
                    { path: 'Assujetti', loadChildren: () => import('./core/pages/gestionSaisDeclaration/gestionSaisDeclaration.module').then(m => m.GestionSaisDeclarationModule) },
                    { path: 'pages', loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) },
                    { path: 'utilisateur', component: GestionUtilisateurComponent },
                    { path: 'vocabulaire', component: VocabulaireComponent },
                    { path: 'parametres', component: ParametreGenerauxComponent },
                    { path: 'profil', component: ProfilComponent },
                    { path: 'controleDeclaration/:id', component: ControleDeclarationComponent },
                    { path: 'juge/:id', component: JugementComponent },

                    
                ]
            },
            
            // Routes pour les modules protégés
            { 
                path: 'parametrage', 
                loadChildren: () => import('./core/pages/parametrage/parametrage.module').then(m => m.ParametrageModule),
                canActivate: [AuthGuard]
            },

            // Routes de sécurité (login)
            { 
                path: 'securite', 
                loadChildren: () => import('./core/pages/securite/securite.module').then(m => m.SecuriteModule) 
            },
            
            // Autres routes qui n'ont pas besoin d'être protégées
            { path: 'auth', loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
            { path: 'landing', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
            { path: 'notfound', component: NotfoundComponent },
            { path: '**', redirectTo: '/notfound' },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}