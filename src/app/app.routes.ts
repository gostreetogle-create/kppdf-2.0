import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { ProductListPageComponent } from './pages/product-list/product-list-page.component';
import { CounterpartyListPageComponent } from './pages/counterparty-list/counterparty-list-page.component';
import { KpListPageComponent } from './pages/kp-list/kp-list-page.component';
import { SettingsPageComponent } from './pages/settings/settings-page.component';
import { OrderListPageComponent } from './pages/orders/order-list-page.component';
import { OrderViewPageComponent } from './pages/orders/order-view-page.component';
import { DocumentEditorPageComponent } from './pages/document-editor/document-editor-page.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        component: DashboardPageComponent,
      },
      {
        path: 'products',
        component: ProductListPageComponent,
      },
      {
        path: 'counterparties',
        component: CounterpartyListPageComponent,
      },
      {
        path: 'kp',
        component: KpListPageComponent,
      },
      {
        path: 'settings',
        component: SettingsPageComponent,
      },
      {
        path: 'orders',
        component: OrderListPageComponent,
      },
      {
        path: 'orders/:id',
        component: OrderViewPageComponent,
      },
      {
        path: 'editor',
        component: DocumentEditorPageComponent,
      },
      {
        path: 'editor/:id',
        component: DocumentEditorPageComponent,
      },
    ],
  },
];
