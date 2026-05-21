import { Component, inject, input, signal, resource, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { GanttChartComponent } from '../../shared/ui/gantt-chart/gantt-chart.component';
import { WorkTaskService } from '../../entities/work-task/data-access/work-task.service';
import { OrderItemService } from '../../entities/order-item/data-access/order-item.service';
import type { GanttOptions, GanttTask } from 'frappe-gantt';

@Component({
  selector: 'app-order-gantt-feature',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    SkeletonModule,
    MessageModule,
    SelectModule,
    FormsModule,
    GanttChartComponent,
  ],
  template: `
    <p-card header="Диаграмма Ганта">
      <ng-template pTemplate="subtitle">
        <div class="gantt-toolbar">
          <p-select
            [options]="viewModes"
            [(ngModel)]="selectedView"
            optionLabel="label"
            optionValue="value"
            styleClass="gantt-toolbar__view"
          />
        </div>
      </ng-template>

      @if (orderTasks.isLoading()) {
        <p-skeleton width="100%" height="300px" />
      } @else if (orderTasks.error(); as err) {
        <p-message severity="error" [text]="'Ошибка загрузки: ' + err.message" />
      } @else {
        <app-gantt-chart
          [tasks]="ganttTasks()"
          [options]="ganttOptions()"
          (taskClick)="onTaskClick($event)"
        />
      }
    </p-card>
  `,
  styles: [`
    .gantt-toolbar { display: flex; gap: 8px; }
    .gantt-toolbar__view { min-width: 140px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderGanttFeatureComponent {
  readonly orderId = input<string>('');

  private readonly workTaskService = inject(WorkTaskService);
  private readonly orderItemService = inject(OrderItemService);

  readonly selectedView = signal<string>('Month');

  readonly viewModes = [
    { label: 'День', value: 'Day' },
    { label: 'Неделя', value: 'Week' },
    { label: 'Месяц', value: 'Month' },
    { label: 'Год', value: 'Year' },
  ];

  /** Сначала загружаем OrderItems, затем WorkTasks по их ID */
  readonly orderTasks = resource({
    params: () => ({ orderId: this.orderId() }),
    loader: async ({ params }) => {
      if (!params.orderId) return [];
      const items = await this.orderItemService.getByOrderId(params.orderId);
      const itemIds = items.map((it) => it._id!).filter(Boolean);
      if (itemIds.length === 0) return [];
      return this.workTaskService.getByOrder(itemIds);
    },
  });

  readonly ganttOptions = computed<GanttOptions>(() => ({
    view_mode: this.selectedView() as GanttOptions['view_mode'],
  }));

  readonly ganttTasks = computed<GanttTask[]>(() => {
    const tasks = this.orderTasks.value() ?? [];
    return tasks.map((t, i) => ({
      id: t._id ?? `task-${i}`,
      name: (t.itemSnapshot?.name ?? t.description.slice(0, 50)) || `Задача ${i + 1}`,
      start: t.startDate ?? new Date().toISOString().slice(0, 10),
      end: t.endDate ?? new Date(Date.now() + (t.plannedHours || 8) * 3600000).toISOString().slice(0, 10),
      progress: t.actualHours && t.plannedHours
        ? Math.round((t.actualHours / t.plannedHours) * 100)
        : 0,
      dependencies: '',
    }));
  });

  onTaskClick(task: GanttTask): void {
    console.log('Gantt task clicked:', task.id, task.name);
    // TODO: открыть детали задачи
  }
}
