import { Component, input, inject, resource, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { OrderService } from '../../entities/order/data-access/order.service';
import { OrderItemService } from '../../entities/order-item/data-access/order-item.service';
import { OrderItemSectionsComponent } from './ui/order-item-sections.component';
import type { IOrderItem } from '../../entities/order-item/models/order-item.model';

@Component({
  selector: 'app-order-view-feature',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    SkeletonModule,
    MessageModule,
    OrderItemSectionsComponent,
  ],
  templateUrl: './order-view-feature.component.html',
  styleUrl: './order-view-feature.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderViewFeatureComponent {
  readonly orderId = input.required<string>();

  private readonly orderService = inject(OrderService);
  private readonly orderItemService = inject(OrderItemService);

  /** resource — загружает заказ и его позиции при изменении orderId */
  readonly orderResource = resource({
    params: () => ({ id: this.orderId() }),
    loader: async ({ params }) => {
      const id = params.id;
      const [order, items] = await Promise.all([
        this.orderService.getById(id),
        this.orderItemService.getByOrderId(id),
      ]);
      return { order, items };
    },
  });

  onReorder(event: {
    sourceSection: string;
    sourceIndex: number;
    targetSection: string;
    targetIndex: number;
  }): void {
    // Группируем текущие items по секциям
    const currentItems = this.orderResource.value()?.items ?? [];
    const grouped = this.groupBySection(currentItems);

    // Извлекаем перемещаемый элемент
    const sourceArr = [...(grouped[event.sourceSection] || [])];
    const [moved] = sourceArr.splice(event.sourceIndex, 1);
    if (!moved) return;

    // Вставляем в целевую секцию
    const targetArr = [...(grouped[event.targetSection] || [])];
    const insertAt = event.targetIndex >= 0 ? event.targetIndex : targetArr.length;
    moved.section = event.targetSection as IOrderItem['section'];
    targetArr.splice(insertAt, 0, moved);

    // Собираем новый плоский массив
    const newItems = [
      ...sourceArr,
      ...targetArr,
      ...(Object.keys(grouped)
        .filter((k) => k !== event.sourceSection && k !== event.targetSection)
        .flatMap((k) => grouped[k] || [])),
    ];

    // Обновляем sortOrder
    const reordered = newItems.map((it, i) => ({ ...it, sortOrder: i * 10 }));
    this.orderResource.update((prev) =>
      prev ? { ...prev, items: reordered } : prev,
    );

    // Сохраняем на сервере
    this.orderItemService
      .reorder(event.sourceSection, reordered.map((it) => it._id!).filter(Boolean) as string[])
      .catch(console.error);
  }

  onItemClick(item: IOrderItem): void {
    console.log('Item clicked:', item._id, item.snapshot.name);
    // TODO: открыть диалог редактирования позиции
  }

  private groupBySection(items: IOrderItem[]): Record<string, IOrderItem[]> {
    const map: Record<string, IOrderItem[]> = {};
    for (const it of items) {
      if (!map[it.section]) map[it.section] = [];
      map[it.section].push(it);
    }
    return map;
  }
}
