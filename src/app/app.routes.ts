import { Routes } from '@angular/router';
import { ProductListPageComponent } from './pages/product-list/product-list-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products',
  },
  {
    path: 'products',
    component: ProductListPageComponent,
  },
];