import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudAssujettisComponent } from './crud-assujettis/crud-assujettis.component';
import { GestionSaisDeclarationRoutingModule } from './gestionSaisDeclaration-routing.module';
import { CrudRoutingModule } from 'src/app/demo/components/pages/crud/crud-routing.module';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { DeclarationDetailsComponent } from './declaration-details/declaration-details.component';
import { SecuriteRoutingModule } from '../securite/securite-routing.module';
import { LoginRoutingModule } from 'src/app/demo/components/auth/login/login-routing.module';
import { CheckboxModule } from 'primeng/checkbox';
import { TableDemoRoutingModule } from 'src/app/demo/components/uikit/table/tabledemo-routing.module';
import { SliderModule } from 'primeng/slider';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { ControleDeclarationComponent } from './controle-declaration/controle-declaration.component';
import { SectionCommentsComponent } from './section-comments/section-comments.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { JugementComponent } from './jugement/jugement.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { StepsModule } from 'primeng/steps';
import { ChartModule } from 'primeng/chart';
import {  NgChartsModule } from 'ng2-charts';
import { MessageModule } from 'primeng/message';
import { MonHistoriqueComponent } from './mon-historique/mon-historique.component';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ConseillerStatsComponent } from './aconseiller-stats/aconseiller-stats.component';
import { AdminStatsComponent } from './admin-stats/admin-stats.component';
import { ProcureurStatsComponent } from './aprocureur-stats/aprocureur-stats.component';
import { AvocatStatsComponent } from './avocat-stats/avocat-stats.component';


@NgModule({
  declarations: [CrudAssujettisComponent,DeclarationDetailsComponent,ControleDeclarationComponent,SectionCommentsComponent,JugementComponent,MonHistoriqueComponent,ProcureurStatsComponent,AdminStatsComponent,ConseillerStatsComponent,AvocatStatsComponent],  // ✅ Déplacer ici
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
    DialogModule,
MessageModule,
MenuModule,
OverlayPanelModule,

        LoginRoutingModule,
        CheckboxModule,
        InputTextModule,
        FormsModule,
        TableDemoRoutingModule,    
  
        SliderModule,
        ToggleButtonModule,
        MultiSelectModule,
        ProgressBarModule,
        SelectButtonModule,
        TooltipModule,
        ReactiveFormsModule,
        TabMenuModule,
        StepsModule,
        
        NgChartsModule,
  ],
  exports :[
    ChartModule
  ]
})
export class GestionSaisDeclarationModule { }
