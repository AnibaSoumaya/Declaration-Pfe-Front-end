import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataViewModule } from 'primeng/dataview';
import { PickListModule } from 'primeng/picklist';
import { OrderListModule } from 'primeng/orderlist';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { VocabulaireComponent } from './vocabulaire/vocabulaire.component';
import { ParametrageRoutingModule } from './parametrage-routing.module';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenubarModule } from 'primeng/menubar';
import { TabMenuModule } from 'primeng/tabmenu';
import { StepsModule } from 'primeng/steps';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuModule } from 'primeng/menu';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MegaMenuModule } from 'primeng/megamenu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { RouterModule } from '@angular/router';
import { MenusComponent } from 'src/app/demo/components/uikit/menus/menus.component';
import { PersonalComponent } from 'src/app/demo/components/uikit/menus/personal.component';
import { ConfirmationComponent } from 'src/app/demo/components/uikit/menus/confirmation.component';
import { PaymentComponent } from 'src/app/demo/components/uikit/menus/payment.component';
import { SeatComponent } from 'src/app/demo/components/uikit/menus/seat.component';
import { TableModule } from 'primeng/table';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ParametrageRoutingModule,
        DataViewModule,
        PickListModule,
        OrderListModule,
        InputTextModule,
        DropdownModule,
        RatingModule,
        ButtonModule,

        TableModule

        
        
    ],
    declarations: [
        VocabulaireComponent,
    ]
})
export class ParametrageModule { }
