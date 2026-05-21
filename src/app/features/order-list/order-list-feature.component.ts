import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { OrderService } from '../../entities/order/data-access/order.service';

@Component({
  selector: 'app-order-list-feature',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    SelectModule,
    SkeletonModule,
    FormsModule,
  ],
  templateUrl: './order-list-feature.component.html',
  styleUrl: './order-list-feature.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListFeatureComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly orders = this.orderService.list;
  readonly loading = this.orderService.loading;
  readonly search = signal('');

  readonly prioritySeverity: Record<string, 'info' | 'warn' | 'danger' | 'success'> = {
    low: 'info',
    normal: 'success',
    high: 'warn',
    urgent: 'danger',
  };

  readonly priorityOptions = [
    { label: 'Все', value: '' },
    { label: 'Низкий', value: 'low' },
    { label: 'Обычный', value: 'normal' },
    { label: 'Высокий', value: 'high' },
    { label: 'Срочный', value: 'urgent' },
  ];

  ngOnInit(): void {
    this.orderService.loadAll();
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.orderService.loadAll({ search: value || undefined });
  }

  onPriorityFilter(value: string): void {
    this.orderService.loadAll({ priority: value || undefined });
  }
}
