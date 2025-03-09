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

import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';

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

        CheckboxModule,
        TableModule

        
        
    ],
    declarations: [
        VocabulaireComponent,
    ]
})
export class ParametrageModule { }
