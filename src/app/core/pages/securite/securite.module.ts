import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecuriteRoutingModule } from './securite-routing.module'; // ✅ Correction de l'import
import { LoginRoutingModule } from 'src/app/demo/components/auth/login/login-routing.module';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { LoginComponent } from './login/login.component';
import { TableDemoRoutingModule } from 'src/app/demo/components/uikit/table/tabledemo-routing.module';
import { TableModule } from 'primeng/table';
import { RatingModule } from 'primeng/rating';
import { SliderModule } from 'primeng/slider';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { GestionUtilisateurComponent } from './gestion-utilisateur/gestion-utilisateur.component';

import { AccessComponent } from './access/access.component';
import { HttpClientModule } from '@angular/common/http';
import { ProfilComponent } from './profil/profil.component';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
/*
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
*/
@NgModule({
  imports: [
    CommonModule,
    SecuriteRoutingModule, 
    LoginRoutingModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    FormsModule,
    PasswordModule,
    TableDemoRoutingModule,    
    TableModule,
    RatingModule,    
    SliderModule,
    ToggleButtonModule,
    RippleModule,
    MultiSelectModule,
    DropdownModule,
    ProgressBarModule,
    ToastModule,
    HttpClientModule,

    ReactiveFormsModule,

    DividerModule,
    
    AvatarModule,
    CardModule,
    RippleModule,
    DialogModule

    
/*
    BrowserModule,
    BrowserAnimationsModule,
    */
    
  ],
  
  declarations: [
    LoginComponent,
    GestionUtilisateurComponent,
    AccessComponent,
    ProfilComponent
    
  ],
})
export class SecuriteModule { }
