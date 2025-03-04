import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GestionUtilisateurComponent } from './gestion-utilisateur/gestion-utilisateur.component';
import { AccessComponent } from './access/access.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'acces', component: AccessComponent },
  { path: 'utilisateur', component: GestionUtilisateurComponent },
  { path: '**', redirectTo: '/notfound' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecuriteRoutingModule { } 
