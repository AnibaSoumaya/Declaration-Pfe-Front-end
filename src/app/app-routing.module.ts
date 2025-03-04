import { RouterModule } from '@angular/router';
import { Component, NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { GestionUtilisateurComponent } from './core/pages/securite/gestion-utilisateur/gestion-utilisateur.component';
import { VocabulaireComponent } from './core/pages/parametrage/vocabulaire/vocabulaire.component';
//import { AdminGuard } from './core/guards/admin.guard';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                
                path: '', component: AppLayoutComponent,
                children: [
                    { path: '', loadChildren: () => import('./demo/components/dashboard/dashboard.module').then(m => m.DashboardModule) },
                    { path: 'uikit', loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UIkitModule) },
                    { path: 'utilities', loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule) },
                    { path: 'documentation', loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule) },
                    { path: 'blocks', loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
                    { path: 'Assujetti', loadChildren: () => import('./core/pages/gestionSaisDeclaration/gestionSaisDeclaration.module').then(m => m.GestionSaisDeclarationModule) },
                    
                    { path: 'pages', loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) },


                    { path: 'utilisateur', component: GestionUtilisateurComponent },
                    { path: 'vocabulaire', component: VocabulaireComponent }
                ]
            },
           // {path: 'admin',Component: AdminComponent,canActivate: [AdminGuard] },
           { path: 'parametrage', loadChildren: () => import('./core/pages/parametrage/parametrage.module').then(m => m.ParametrageModule) },

            { path: 'securite', loadChildren: () => import('./core/pages/securite/securite.module').then(m => m.SecuriteModule) },
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
