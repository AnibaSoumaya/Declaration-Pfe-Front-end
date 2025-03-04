import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrudAssujettisComponent } from './crud-assujettis/crud-assujettis.component';

const routes: Routes = [
    { path: '**', redirectTo: '/notfound' }
];

@NgModule({
    imports: [RouterModule.forChild([
        { path: '',  component: CrudAssujettisComponent},
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class GestionSaisDeclarationRoutingModule { }
