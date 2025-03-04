import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudAssujettisComponent } from './crud-assujettis/crud-assujettis.component';
import { GestionSaisDeclarationRoutingModule } from './gestionSaisDeclaration-routing.module';
import { CrudRoutingModule } from 'src/app/demo/components/pages/crud/crud-routing.module';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [CrudAssujettisComponent],  // ✅ Déplacer ici
  imports: [
    CommonModule,
    GestionSaisDeclarationRoutingModule,
    CommonModule,
    CrudRoutingModule,
    TableModule,
    FileUploadModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule 
  ],
})
export class GestionSaisDeclarationModule { }
