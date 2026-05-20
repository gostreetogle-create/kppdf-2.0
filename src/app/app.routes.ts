import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { ProductListPageComponent } from './pages/product-list/product-list-page.component';
import { CounterpartyListPageComponent } from './pages/counterparty-list/counterparty-list-page.component';
import { PlaceholderPageComponent } from './pages/placeholder/placeholder-page.component';

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
        component: PlaceholderPageComponent,
        data: { title: 'Коммерческие предложения' },
      },
      {
        path: 'settings',
        component: PlaceholderPageComponent,
        data: { title: 'Настройки' },
      },
    ],
  },
];
