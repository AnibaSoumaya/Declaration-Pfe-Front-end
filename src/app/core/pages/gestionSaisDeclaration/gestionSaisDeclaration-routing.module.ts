import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrudAssujettisComponent } from './crud-assujettis/crud-assujettis.component';
import { DeclarationDetailsComponent } from './declaration-details/declaration-details.component';
import { ControleDeclarationComponent } from './controle-declaration/controle-declaration.component';
import { SectionCommentsComponent } from './section-comments/section-comments.component';

const routes: Routes = [
    { path: '**', redirectTo: '/notfound' }
];

@NgModule({
    imports: [RouterModule.forChild([
        { path: '',  component: CrudAssujettisComponent},
        { path: 'decDetails',  component: DeclarationDetailsComponent},
        { path: 'commentaires',  component: SectionCommentsComponent},
        { path: 'controleDeclaration/:id', component: ControleDeclarationComponent },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class GestionSaisDeclarationRoutingModule { }
