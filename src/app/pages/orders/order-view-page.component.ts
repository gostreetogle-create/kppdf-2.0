import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { OrderViewFeatureComponent } from '../../features/order-view/order-view-feature.component';
import { OrderGanttFeatureComponent } from '../../features/order-gantt/order-gantt-feature.component';

@Component({
  selector: 'app-order-view-page',
  standalone: true,
  imports: [TabsModule, OrderViewFeatureComponent, OrderGanttFeatureComponent],
  template: `
    <p-tabs value="sections">
      <p-tablist>
        <p-tab value="sections">Позиции</p-tab>
        <p-tab value="gantt">Гант</p-tab>
      </p-tablist>
      <p-tabpanels>
        <p-tabpanel value="sections">
          <app-order-view-feature [orderId]="orderId" />
        </p-tabpanel>
        <p-tabpanel value="gantt">
          <app-order-gantt-feature [orderId]="orderId" />
        </p-tabpanel>
      </p-tabpanels>
    </p-tabs>
  `,
  styles: [`
    :host { display: block; padding: 16px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderViewPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly orderId = this.route.snapshot.paramMap.get('id') ?? '';
}
