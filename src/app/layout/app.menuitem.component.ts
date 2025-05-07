import { ChangeDetectorRef, Component, Host, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MenuService } from './app.menu.service';
import { LayoutService } from './service/app.layout.service';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[app-menuitem]',
    template: `
<ng-container>
    <!-- Root menu title -->
    <div *ngIf="root && item.visible !== false"
         class="menu-root-item">
        {{item.label}}
    </div>
    <!-- Link without routerLink or with sub-items -->
    <a *ngIf="(!item.routerLink || item.items) && item.visible !== false"
       [attr.href]="item.url"
       (click)="itemClick($event)"
       [ngClass]="item.class"
       [attr.target]="item.target"
       tabindex="0"
       pRipple
       class="menu-item">
        <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
        <span class="layout-menuitem-text" *ngIf="!root">{{item.label}}</span>
        <span *ngIf="item.badge" class="menu-badge">{{item.badge}}</span>
        <i class="pi pi-chevron-down submenu-toggle" *ngIf="item.items && !root"
           [ngClass]="{'submenu-open': submenuAnimation === 'visible'}"></i>
    </a>
    
    <!-- Link with routerLink (without sub-items) -->
    <a *ngIf="(item.routerLink && !item.items) && item.visible !== false"
       (click)="itemClick($event)"
       [ngClass]="item.class"
       [routerLink]="item.routerLink"
       routerLinkActive="active-route"
       [routerLinkActiveOptions]="item.routerLinkActiveOptions || { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }"
       [fragment]="item.fragment"
       [queryParamsHandling]="item.queryParamsHandling"
       [preserveFragment]="item.preserveFragment"
       [skipLocationChange]="item.skipLocationChange"
       [replaceUrl]="item.replaceUrl"
       [state]="item.state"
       [queryParams]="item.queryParams"
       [attr.target]="item.target"
       tabindex="0"
       pRipple
       class="menu-item">
        <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
        <span class="layout-menuitem-text" *ngIf="!root">{{item.label}}</span>
        <span *ngIf="item.badge" class="menu-badge">{{item.badge}}</span>
    </a>
    
    <!-- Submenu -->
    <ul *ngIf="item.items && item.visible !== false" [@children]="submenuAnimation" class="submenu">
        <ng-template ngFor let-child let-i="index" [ngForOf]="item.items">
            <li app-menuitem [item]="child" [index]="i" [parentKey]="key" [class]="child.badgeClass"></li>
        </ng-template>
    </ul>
    
    <!-- Styles for the menu -->
    <style>
        /* Root menu item style */
        .menu-root-item {
            font-weight: 600;
            color: #333;
            padding: 1rem 1.5rem;
            background-color: #F57C00;
            color: white;
            margin-bottom: 0.75rem;
            border-radius: 12px;
            letter-spacing: 0.5px;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 10px rgba(245, 124, 0, 0.2);
        }
        
        /* Menu item style */
        .menu-item {
            display: flex;
            align-items: center;
            padding: 0.9rem 1.2rem;
            color: #546e7a;
            background-color: white;
            text-decoration: none;
            margin-bottom: 10px;
            border-radius: 12px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
            position: relative;
            overflow: hidden;
        }
        
        .menu-item:hover {
            background-color: #fff8f0;
            color: #F57C00;
            transform: translateX(5px);
            box-shadow: 0 4px 12px rgba(245, 124, 0, 0.15);
        }
        
        /* Icon style */
        .layout-menuitem-icon {
            margin-right: 0.85rem;
            font-size: 1.2rem;
            color: #607d8b;
            background-color: #f5f5f5;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        .menu-item:hover .layout-menuitem-icon {
            color: #ffffff;
            background-color: #F57C00;
        }
        
        /* Menu text style */
        .layout-menuitem-text {
            font-size: 0.95rem;
            font-weight: 500;
            flex: 1;
        }
        
        /* Submenu toggle icon */
        .submenu-toggle {
            margin-left: auto;
            transition: transform 0.4s ease;
            font-size: 0.85rem;
            color: #90a4ae;
        }
        
        .submenu-toggle.submenu-open {
            transform: rotate(180deg);
            color: #F57C00;
        }
        
        /* Badge style */
        .menu-badge {
            background-color: #F57C00;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            font-weight: bold;
            margin-left: 8px;
        }
        
        /* Submenu style */
        .submenu {
            padding-left: 1.2rem;
            margin-top: -4px;
            margin-bottom: 15px;
            list-style-type: none;
            border-left: 2px solid #ffe0b2;
            margin-left: 17px;
            overflow: hidden;
            padding-top: 5px;
            padding-bottom: 5px;
            animation: slideDown 0.3s ease-out;
        }
        
        .submenu li {
            margin-bottom: 8px;
        }
        
        .submenu .menu-item {
            margin-bottom: 6px;
            padding: 0.75rem 1rem;
            box-shadow: none;
            background-color: transparent;
        }
        
        .submenu .menu-item:hover {
            background-color: #fff8f0;
            box-shadow: 0 2px 8px rgba(245, 124, 0, 0.1);
        }
        
        .submenu .layout-menuitem-icon {
            width: 30px;
            height: 30px;
            font-size: 1rem;
        }
        
        /* Active route style */
        .active-route {
            background-color: #fff8f0;
            color: #F57C00 !important;
            border-left: 4px solid #F57C00;
            font-weight: 500 !important;
            box-shadow: 0 4px 10px rgba(245, 124, 0, 0.15);
        }
        
        .active-route .layout-menuitem-icon {
            color: white !important;
            background-color: #F57C00;
        }
        
        /* Animations */
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Add a subtle ripple effect */
        .menu-item::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            background: rgba(245, 124, 0, 0.15);
            opacity: 0;
            border-radius: 100%;
            transform: scale(1) translate(-50%, -50%);
            transform-origin: 0 0;
        }
        
        .menu-item:active::after {
            opacity: 1;
            animation: ripple 0.6s ease-out;
        }
        
        @keyframes ripple {
            0% {
                transform: scale(0) translate(-50%, -50%);
                opacity: 1;
            }
            100% {
                transform: scale(20) translate(-50%, -50%);
                opacity: 0;
            }
        }
        
        /* Section separators */
        .menu-section {
            font-size: 0.85rem;
            color: #90a4ae;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 20px 0 10px;
            padding-left: 10px;
            font-weight: 600;
        }
    </style>
</ng-container>


    `,
    animations: [
        trigger('children', [
            state('collapsed', style({
                height: '0'
            })),
            state('expanded', style({
                height: '*'
            })),
            transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ])
    ]
})
export class AppMenuitemComponent implements OnInit, OnDestroy {

    @Input() item: any;

    @Input() index!: number;

    @Input() @HostBinding('class.layout-root-menuitem') root!: boolean;

    @Input() parentKey!: string;

    active = false;

    menuSourceSubscription: Subscription;

    menuResetSubscription: Subscription;

    key: string = "";

    constructor(public layoutService: LayoutService, private cd: ChangeDetectorRef, public router: Router, private menuService: MenuService) {
        this.menuSourceSubscription = this.menuService.menuSource$.subscribe(value => {
            Promise.resolve(null).then(() => {
                if (value.routeEvent) {
                    this.active = (value.key === this.key || value.key.startsWith(this.key + '-')) ? true : false;
                }
                else {
                    if (value.key !== this.key && !value.key.startsWith(this.key + '-')) {
                        this.active = false;
                    }
                }
            });
        });

        this.menuResetSubscription = this.menuService.resetSource$.subscribe(() => {
            this.active = false;
        });

        this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(params => {
                if (this.item.routerLink) {
                    this.updateActiveStateFromRoute();
                }
            });
    }

    ngOnInit() {
        this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);

        if (this.item.routerLink) {
            this.updateActiveStateFromRoute();
        }
    }

    updateActiveStateFromRoute() {
        let activeRoute = this.router.isActive(this.item.routerLink[0], { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' });

        if (activeRoute) {
            this.menuService.onMenuStateChange({ key: this.key, routeEvent: true });
        }
    }

    itemClick(event: Event) {
        // avoid processing disabled items
        if (this.item.disabled) {
            event.preventDefault();
            return;
        }

        // execute command
        if (this.item.command) {
            this.item.command({ originalEvent: event, item: this.item });
        }

        // toggle active state
        if (this.item.items) {
            this.active = !this.active;
        }

        this.menuService.onMenuStateChange({ key: this.key });
    }

    get submenuAnimation() {
        return this.root ? 'expanded' : (this.active ? 'expanded' : 'collapsed');
    }

    @HostBinding('class.active-menuitem') 
    get activeClass() {
        return this.active && !this.root;
    }

    ngOnDestroy() {
        if (this.menuSourceSubscription) {
            this.menuSourceSubscription.unsubscribe();
        }

        if (this.menuResetSubscription) {
            this.menuResetSubscription.unsubscribe();
        }
    }
}
