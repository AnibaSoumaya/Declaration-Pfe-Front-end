import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrudAssujettisComponent } from './crud-assujettis/crud-assujettis.component';
import { DeclarationDetailsComponent } from './declaration-details/declaration-details.component';
import { ControleDeclarationComponent } from './controle-declaration/controle-declaration.component';
import { SectionCommentsComponent } from './section-comments/section-comments.component';
import { NotificationPanelComponent } from './notification-panel/notification-panel.component';
import { JugementComponent } from './jugement/jugement.component';
import { MonHistoriqueComponent } from './mon-historique/mon-historique.component';
import { ConseillerStatsComponent } from './aconseiller-stats/aconseiller-stats.component';
import { AvocatStatsComponent } from './avocat-stats/avocat-stats.component';
import { ProcureurStatsComponent } from './aprocureur-stats/aprocureur-stats.component';
import { AdminStatsComponent } from './admin-stats/admin-stats.component';

const routes: Routes = [
    { path: '**', redirectTo: '/notfound' }
];

@NgModule({
    imports: [RouterModule.forChild([
        { path: '',  component: CrudAssujettisComponent},
        { path: 'decDetails',  component: DeclarationDetailsComponent},
        { path: 'commentaires',  component: SectionCommentsComponent},
        { path: 'notifications',  component: NotificationPanelComponent},
        { path: 'controleDeclaration/:id', component: ControleDeclarationComponent },
        { path: 'juge/:id', component: JugementComponent},
        //{ path: 'BI',  component: BIComponent},
        { path: 'historique',  component: MonHistoriqueComponent},
                { path: 'AdminStat',  component: AdminStatsComponent},
        { path: 'pgStat',  component: ProcureurStatsComponent},
        { path: 'conseillerstat',  component: ConseillerStatsComponent},
        { path: 'avocatstat',  component: AvocatStatsComponent},



        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class GestionSaisDeclarationRoutingModule { }
