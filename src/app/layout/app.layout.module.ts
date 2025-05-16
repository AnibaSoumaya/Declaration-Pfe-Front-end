import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { BadgeModule } from 'primeng/badge';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RippleModule } from 'primeng/ripple';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { RouterModule } from '@angular/router';
import { AppTopBarComponent } from './app.topbar.component';
import { AppFooterComponent } from './app.footer.component';
import { AppConfigModule } from './config/config.module';
import { AppSidebarComponent } from "./app.sidebar.component";
import { AppLayoutComponent } from "./app.layout.component";
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenubarModule } from 'primeng/menubar';
import { TabMenuModule } from 'primeng/tabmenu';
import { StepsModule } from 'primeng/steps';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuModule } from 'primeng/menu';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MegaMenuModule } from 'primeng/megamenu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenusComponent } from '../demo/components/uikit/menus/menus.component';
import { PersonalComponent } from '../demo/components/uikit/menus/personal.component';
import { ConfirmationComponent } from '../demo/components/uikit/menus/confirmation.component';
import { SeatComponent } from '../demo/components/uikit/menus/seat.component';
import { PaymentComponent } from '../demo/components/uikit/menus/payment.component';
import { DialogModule } from 'primeng/dialog';
import { NotificationPanelComponent } from '../core/pages/gestionSaisDeclaration/notification-panel/notification-panel.component';

@NgModule({
    declarations: [
        AppMenuitemComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppMenuComponent,
        AppSidebarComponent,
        AppLayoutComponent,
        NotificationPanelComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        InputTextModule,
        SidebarModule,
        BadgeModule,
        RadioButtonModule,
        InputSwitchModule,
        RippleModule,
        RouterModule,
        AppConfigModule,



        BreadcrumbModule,
        MenubarModule,
        TabMenuModule,
        StepsModule,
        TieredMenuModule,
        MenuModule,
        ContextMenuModule,
        MegaMenuModule,
        PanelMenuModule,
        DialogModule,
        RouterModule.forChild([
                            {
                                path: '', component: MenusComponent, children: [
                                    { path: '', redirectTo: 'personal', pathMatch: 'full' },
                                    { path: 'personal', component: PersonalComponent },
                                    { path: 'confirmation', component: ConfirmationComponent },
                                    { path: 'seat', component: SeatComponent },
                                    { path: 'payment', component: PaymentComponent }
                                ]
                            }
                        ])
    ],
    exports: [AppLayoutComponent]
})
export class AppLayoutModule { }
