import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProductListFeatureComponent } from '../../features/product-list/product-list-feature.component';

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [ProductListFeatureComponent],
  template: `
    <main class="product-list-page">
      <app-product-list-feature />
    </main>
  `,
  styleUrls: ['./product-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPageComponent {}