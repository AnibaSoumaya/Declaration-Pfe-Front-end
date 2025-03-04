import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VocabulaireComponent } from './vocabulaire/vocabulaire.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'vocabulaire', component: VocabulaireComponent }
    ])],
    exports: [RouterModule]
})
export class ParametrageRoutingModule { }
