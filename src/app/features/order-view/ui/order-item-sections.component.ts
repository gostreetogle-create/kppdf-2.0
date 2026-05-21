import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import type { IOrderItem } from '../../../entities/order-item/models/order-item.model';

/** Секция — группировка позиций */
export interface ISectionConfig {
  key: string;
  label: string;
  icon: string;
  color: string;
  items: IOrderItem[];
}

const SECTION_CONFIGS: Record<string, { label: string; icon: string; color: string }> = {
  materials: { label: 'Материалы', icon: 'pi pi-box', color: '#6366f1' },
  work: { label: 'Работы', icon: 'pi pi-wrench', color: '#8b5cf6' },
  task: { label: 'Задачи', icon: 'pi pi-check-square', color: '#ec4899' },
  drawing: { label: 'Чертежи / Документация', icon: 'pi pi-file-pdf', color: '#14b8a6' },
};

@Component({
  selector: 'app-order-item-sections',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TagModule],
  templateUrl: './order-item-sections.component.html',
  styleUrl: './order-item-sections.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderItemSectionsComponent {
  readonly items = input<IOrderItem[]>([]);
  /** Действие при клике на позицию */
  readonly itemClick = output<IOrderItem>();

  readonly groupedSections = computed<ISectionConfig[]>(() => {
    const items = this.items();
    return Object.entries(SECTION_CONFIGS).map(([key, cfg]) => ({
      key,
      ...cfg,
      items: items.filter((it) => it.section === key).sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  });

  // Drag-and-drop state
  readonly dragIndex = signal<{ section: string; index: number } | null>(null);

  onDragStart(section: string, index: number, event: DragEvent): void {
    this.dragIndex.set({ section, index });
    event.dataTransfer?.setData('text/plain', `${section}:${index}`);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(targetSection: string, targetIndex: number, event: DragEvent): void {
    event.preventDefault();
    const source = this.dragIndex();
    if (!source) return;

    // Reorder: this is a signal-driven trigger for the parent
    // The actual API call is handled by the smart component
    this._drop(source.section, source.index, targetSection, targetIndex);
    this.dragIndex.set(null);
  }

  /** We emit a custom event that the parent smart component handles */
  readonly reorder = output<{
    sourceSection: string;
    sourceIndex: number;
    targetSection: string;
    targetIndex: number;
  }>();

  private _drop(section: string, idx: number, targetSection: string, targetIdx: number): void {
    this.reorder.emit({
      sourceSection: section,
      sourceIndex: idx,
      targetSection,
      targetIndex: targetIdx,
    });
  }

  /** Сумма по секции */
  sectionTotal(items: IOrderItem[]): number {
    return items.reduce((s, it) => s + it.totalPrice, 0);
  }

  /** Тип тега по kind */
  kindSeverity(kind: string): 'info' | 'warn' | 'success' | undefined {
    switch (kind) {
      case 'ITEM': return 'info';
      case 'SERVICE': return 'warn';
      case 'WORK': return 'success';
      default: return undefined;
    }
  }

  kindLabel(kind: string): string {
    switch (kind) {
      case 'ITEM': return 'Товар';
      case 'SERVICE': return 'Услуга';
      case 'WORK': return 'Работа';
      default: return kind;
    }
  }
}
