import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VocabulaireComponent } from './vocabulaire/vocabulaire.component';
import { ParametreGenerauxComponent } from './parametre-generaux/parametre-generaux.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'vocabulaire', component: VocabulaireComponent },
        { path: 'parametres', component: ParametreGenerauxComponent }
    ])],
    exports: [RouterModule]
})
export class ParametrageRoutingModule { }
