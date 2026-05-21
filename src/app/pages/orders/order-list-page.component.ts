import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrderListFeatureComponent } from '../../features/order-list/order-list-feature.component';

@Component({
  selector: 'app-order-list-page',
  standalone: true,
  imports: [OrderListFeatureComponent],
  template: ` <app-order-list-feature /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListPageComponent {}
