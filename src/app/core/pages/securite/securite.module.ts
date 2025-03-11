import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecuriteRoutingModule } from './securite-routing.module'; // ✅ Correction de l'import
import { LoginRoutingModule } from 'src/app/demo/components/auth/login/login-routing.module';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
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
    
  ],
  declarations: [
    LoginComponent,
    GestionUtilisateurComponent,
    AccessComponent
    
  ],
})
export class SecuriteModule { }
