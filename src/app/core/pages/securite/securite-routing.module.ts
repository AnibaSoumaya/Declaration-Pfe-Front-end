import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GestionUtilisateurComponent } from './gestion-utilisateur/gestion-utilisateur.component';
import { AccessComponent } from './access/access.component';
import { ProfilComponent } from './profil/profil.component';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  // Route publique pour la connexion
  { path: '', component: LoginComponent },
  
  // Routes protégées nécessitant une authentification
  { path: 'acces', component: AccessComponent, canActivate: [AuthGuard] },
  { path: 'utilisateur', component: GestionUtilisateurComponent, canActivate: [AuthGuard] },
  { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: '/notfound' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecuriteRoutingModule { }