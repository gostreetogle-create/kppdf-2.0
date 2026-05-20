import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductKind } from '../../entities/product/models/product.model';
import { Product } from '../../entities/product/models/product.model';
import { ProductService } from '../../entities/product/data-access/product.service';
import {
  ProductFormDialogComponent,
  ProductFormValue,
} from '../../entities/product/ui/product-form-dialog/product-form-dialog.component';
import { ProductKindLabelPipe } from '../../entities/product/ui/product-kind-label/product-kind-label.pipe';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-product-list-feature',
  standalone: true,
  imports: [
    FormsModule,
    SelectButtonModule,
    TableModule,
    ButtonModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressSpinnerModule,
    MessageModule,
    TooltipModule,
    InputTextModule,
    ProductFormDialogComponent,
    ProductKindLabelPipe,
    PricePipe,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './product-list-feature.component.html',
  styleUrls: ['./product-list-feature.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListFeatureComponent {
  private readonly productService = inject(ProductService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  /** Фильтр по типу */
  readonly selectedKind = signal<ProductKind | 'ALL'>('ALL');
  readonly kindOptions = [
    { value: 'ALL', label: 'Все' },
    { value: 'ITEM', label: 'Товары' },
    { value: 'SERVICE', label: 'Услуги' },
    { value: 'WORK', label: 'Работы' },
  ];

  /** Состояние загрузки списка */
  private readonly resourceState = this.productService.products;
  readonly loading = computed(() => this.resourceState().loading);
  readonly error = computed(() => this.resourceState().error);
  readonly allProducts = computed(() => this.resourceState().data);

  /** Отфильтрованные товары */
  readonly filteredProducts = computed(() => {
    const kind = this.selectedKind();
    return kind === 'ALL' ? this.allProducts() : this.allProducts().filter((p) => p.kind === kind);
  });

  // ---- Управление диалогом создания/редактирования ----
  readonly showDialog = signal(false);
  readonly editingProduct = signal<Product | null>(null);

  /** Состояние операции (чтобы блокировать кнопку «Сохранить» во время запроса) */
  readonly saving = signal(false);

  // ---- Открыть диалог создания ----
  onCreate(): void {
    this.editingProduct.set(null);
    this.showDialog.set(true);
  }

  // ---- Открыть диалог редактирования ----
  onEdit(product: Product): void {
    this.editingProduct.set(product);
    this.showDialog.set(true);
  }

  // ---- Сохранение (создание / обновление) ----
  onSave(value: ProductFormValue): void {
    this.saving.set(true);
    const product = this.editingProduct();

    const request$ = product
      ? this.productService.update(product.id, value)
      : this.productService.create(value);

    request$.pipe(
      map(() => true),
      catchError((err: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: err.message ?? 'Не удалось сохранить товар',
        });
        return of(false);
      }),
    ).subscribe((success) => {
      this.saving.set(false);
      if (success) {
        this.showDialog.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Готово',
          detail: product ? 'Товар обновлён' : 'Товар создан',
        });
      }
    });
  }

  // ---- Отмена диалога ----
  onCancelDialog(): void {
    this.showDialog.set(false);
  }

  // ---- Удаление с подтверждением ----
  onDelete(product: Product): void {
    this.confirmationService.confirm({
      message: `Удалить товар «${product.name}»?`,
      header: 'Подтверждение',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.delete(product.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Готово',
              detail: 'Товар удалён',
            });
          },
          error: (err: Error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Ошибка',
              detail: err.message ?? 'Не удалось удалить товар',
            });
          },
        });
      },
    });
  }

  /** Severity для p-tag по типу товара */
  kindSeverity(kind: ProductKind): 'info' | 'success' | 'warn' {
    switch (kind) {
      case 'ITEM': return 'info';
      case 'SERVICE': return 'success';
      case 'WORK': return 'warn';
    }
  }
}
