import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, OnInit, signal } from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ImageUploaderComponent } from '../../../../shared/ui/image-uploader/image-uploader.component';
import { Product, ProductKind } from '../../models/product.model';
import { ProductService } from '../../data-access/product.service';
import { SettingsService } from '../../../settings/data-access/settings.service';

/** @deprecated Will be replaced by BOMTreeEditor in PLM architecture */
export interface IProductComponent {
  productId: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
}

export interface ProductFormValue {
  name: string;
  code: string;
  description: string;
  price: number;
  unit: string;
  kind: ProductKind;
  images: string[];
  category: string;
  subcategory: string;
  isActive: boolean;
  components: IProductComponent[];
}

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    ToggleSwitchModule,
    ButtonModule,
    TableModule,
    DecimalPipe,
    ImageUploaderComponent,
  ],
  template: `
    <p-dialog
      [header]="product() ? 'Редактировать товар' : 'Новый товар'"
      [modal]="true"
      [visible]="true"
      [style]="{ width: '680px' }"
      (onHide)="onCancel()"
    >
      <form [formGroup]="form" class="product-form">
        <!-- Название -->
        <div class="product-form__field">
          <label class="product-form__label" for="name">Название *</label>
          <input id="name" pInputText formControlName="name" class="product-form__input" />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <small class="product-form__error">Обязательное поле</small>
          }
        </div>

        <!-- Артикул + Тип -->
        <div class="product-form__row">
          <div class="product-form__field">
            <label class="product-form__label" for="code">Артикул</label>
            <input id="code" pInputText formControlName="code" class="product-form__input" />
          </div>
          <div class="product-form__field">
            <label class="product-form__label" for="kind">Тип *</label>
            <p-select
              id="kind"
              formControlName="kind"
              [options]="kindOptions"
              optionLabel="label"
              optionValue="value"
              [style]="{ width: '100%' }"
              appendTo="body"
              (onChange)="onKindChange()"
            />
          </div>
        </div>

        <!-- Описание -->
        <div class="product-form__field">
          <label class="product-form__label" for="description">Описание</label>
          <textarea id="description" pTextarea formControlName="description" class="product-form__input" rows="3"></textarea>
        </div>

        @if (isComplex) {
          <!-- ===== РЕЖИМ КОМПЛЕКСА ===== -->
          <div class="product-form__field">
            <span class="product-form__label">Общая цена (рассчитана автоматически)</span>
            <span class="product-form__computed-price">{{ totalPrice() | number:'1.2-2' }} ₽</span>
          </div>

          <div class="product-form__section">
            <h3 class="product-form__section-title">Состав комплекса</h3>

            @if (components().length === 0) {
              <p class="product-form__hint">Добавьте товары или услуги в состав комплекса.</p>
            } @else {
              <p-table [value]="components()" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Товар</th>
                    <th style="width:100px">Кол-во</th>
                    <th style="width:80px">Ед.</th>
                    <th style="width:120px">Цена</th>
                    <th style="width:120px">Сумма</th>
                    <th style="width:60px"></th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-comp let-i="rowIndex">
                  <tr>
                    <td>{{ comp.name }}</td>
                    <td>
                      <p-inputNumber
                        [ngModel]="comp.qty"
                        (ngModelChange)="updateComponentQty(i, $event)"
                        [ngModelOptions]="{standalone: true}"
                        [min]="1"
                        style="width:100%"
                      />
                    </td>
                    <td>{{ comp.unit }}</td>
                    <td>{{ comp.price | number:'1.2-2' }} ₽</td>
                    <td>{{ comp.price * comp.qty | number:'1.2-2' }} ₽</td>
                    <td>
                      <p-button
                        icon="pi pi-trash"
                        severity="danger"
                        [text]="true"
                        [rounded]="true"
                        (click)="removeComponent(i)"
                      />
                    </td>
                  </tr>
                </ng-template>
              </p-table>

              <div class="product-form__total">
                <strong>Итого: {{ totalPrice() | number:'1.2-2' }} ₽</strong>
              </div>
            }

            <!-- Добавление компонента -->
            <div class="product-form__add-row">
              <p-select
                [options]="availableProducts()"
                optionLabel="label"
                optionValue="value"
                [(ngModel)]="selectedProductId"
                [ngModelOptions]="{standalone: true}"
                [filter]="true"
                placeholder="Выберите товар или услугу…"
                styleClass="product-form__add-select"
                appendTo="body"
              />
              <p-inputNumber
                [(ngModel)]="newComponentQty"
                [ngModelOptions]="{standalone: true}"
                [min]="1"
                [max]="99999"
                style="width:100px"
                placeholder="Кол-во"
              />
              <p-button
                label="Добавить"
                icon="pi pi-plus"
                [disabled]="!selectedProductId()"
                (click)="addComponent()"
              />
            </div>
          </div>
        } @else {
          <!-- ===== ОБЫЧНЫЙ РЕЖИМ (Товар / Услуга / Работа) ===== -->
          <div class="product-form__row">
            <div class="product-form__field">
              <label class="product-form__label" for="price">Цена *</label>
              <p-inputNumber
                id="price"
                formControlName="price"
                [min]="0"
                mode="decimal"
                [locale]="'ru-RU'"
                class="product-form__input"
              />
              @if (form.get('price')?.invalid && form.get('price')?.touched) {
                <small class="product-form__error">Обязательное поле</small>
              }
            </div>
            <div class="product-form__field">
              <label class="product-form__label" for="unit">Ед. изм. *</label>
              <p-select
                id="unit"
                formControlName="unit"
                [options]="unitOptions()"
                optionLabel="label"
                optionValue="value"
                [style]="{ width: '100%' }"
                appendTo="body"
              />
              @if (form.get('unit')?.invalid && form.get('unit')?.touched) {
                <small class="product-form__error">Обязательное поле</small>
              }
            </div>
          </div>
        }

        <!-- Категория / Подкатегория -->
        <div class="product-form__row">
          <div class="product-form__field">
            <label class="product-form__label" for="category">Категория</label>
            <p-select
              id="category"
              formControlName="category"
              [options]="categoryOptions"
              [showClear]="true"
              placeholder="Выберите категорию"
              appendTo="body"
              (onChange)="onCategoryChange()"
            />
          </div>
          <div class="product-form__field">
            <label class="product-form__label" for="subcategory">Подкатегория</label>
            <p-select
              id="subcategory"
              formControlName="subcategory"
              [options]="subcategoryOptions()"
              [showClear]="true"
              placeholder="Выберите подкатегорию"
              appendTo="body"
            />
          </div>
        </div>

        <!-- Изображения -->
        <div class="product-form__field">
          <span class="product-form__label">Изображения</span>
          <app-image-uploader [(value)]="images" />
        </div>

        <!-- Активен -->
        <div class="product-form__field product-form__switch">
          <p-toggleSwitch formControlName="isActive" inputId="isActive" />
          <label class="product-form__label" for="isActive">Активен</label>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button label="Отмена" severity="secondary" (click)="onCancel()" />
        <p-button
          [label]="product() ? 'Сохранить' : 'Создать'"
          [disabled]="form.invalid || saving() || (isComplex && components().length < 1)"
          (click)="onSave()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .product-form { display: flex; flex-direction: column; gap: 1rem; }
    .product-form__row { display: flex; gap: 1rem; }
    .product-form__row > .product-form__field { flex: 1; }
    .product-form__field { display: flex; flex-direction: column; gap: 0.25rem; }
    .product-form__label { font-weight: 600; font-size: 0.875rem; color: var(--p-text-color); }
    .product-form__input { width: 100%; }
    .product-form__error { color: var(--p-red-500); font-size: 0.75rem; }
    .product-form__switch { flex-direction: row; align-items: center; gap: 0.5rem; }
    .product-form__section { border: 1px solid var(--p-surface-300); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .product-form__section-title { margin: 0; font-size: 1rem; font-weight: 700; }
    .product-form__hint { color: var(--p-text-muted-color); font-size: 0.875rem; margin: 0; }
    .product-form__total { text-align: right; font-size: 1rem; padding: 0.25rem 0; }
    .product-form__add-row { display: flex; gap: 0.5rem; align-items: center; }
    .product-form__add-select { flex: 1; min-width: 0; }
    .product-form__computed-price { font-size: 1.25rem; font-weight: 700; color: var(--p-primary-color); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly settingsService = inject(SettingsService);

  readonly product = input<Product | null>(null);
  readonly saved = output<ProductFormValue>();
  readonly cancelled = output<void>();

  readonly saving = signal(false);

  readonly kindOptions = [
    { value: 'ITEM' as ProductKind, label: 'Товар' },
    { value: 'SERVICE' as ProductKind, label: 'Услуга' },
    { value: 'WORK' as ProductKind, label: 'Работа' },
    { value: 'COMPLEX' as ProductKind, label: 'Комплекс' },
  ];

  readonly categoryOptions = [
    'Оборудование',
    'Расходные материалы',
    'Услуги',
    'Программное обеспечение',
    'Строительные материалы',
    'Электроника',
    'Мебель',
    'Транспортные услуги',
    'Консалтинг',
    'Прочее',
  ];

  private readonly subcategoryMap: Record<string, string[]> = {
    'Оборудование': ['Станки', 'Инструмент', 'Измерительное', 'Компрессоры', 'Насосы', 'Прочее'],
    'Расходные материалы': ['Канцелярия', 'Хозтовары', 'Смазочные материалы', 'Фильтры', 'Прочее'],
    'Услуги': ['Монтаж', 'Наладка', 'Ремонт', 'Обслуживание', 'Консультация', 'Прочее'],
    'Программное обеспечение': ['Лицензии', 'Подписки', 'Разработка', 'Интеграция', 'Прочее'],
    'Строительные материалы': ['Цемент', 'Песок', 'Металл', 'Древесина', 'Кровля', 'Прочее'],
    'Электроника': ['Компьютеры', 'Комплектующие', 'Периферия', 'Сетевое', 'Прочее'],
    'Мебель': ['Офисная', 'Для дома', 'Складская', 'Прочее'],
    'Транспортные услуги': ['Доставка', 'Перевозка', 'Экспедирование', 'Прочее'],
    'Консалтинг': ['Юридический', 'Бухгалтерский', 'IT', 'Управленческий', 'Прочее'],
    'Прочее': ['Прочее'],
  };

  readonly subcategoryOptions = computed(() => {
    const category = this.form.controls.category.value;
    if (!category) return [];
    return this.subcategoryMap[category] ?? ['Прочее'];
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    code: [''],
    description: [''],
    price: [0, Validators.required],
    unit: ['', Validators.required],
    kind: ['ITEM' as ProductKind, Validators.required],
    category: [''],
    subcategory: [''],
    isActive: [true],
  });

  // ---- Изображения ----
  readonly images = signal<string[]>([]);

  // ---- Состояние комплекса ----
  readonly components = signal<IProductComponent[]>([]);
  readonly selectedProductId = signal<string | null>(null);
  readonly newComponentQty = signal<number>(1);

  /** Является ли текущий тип COMPLEX */
  get isComplex(): boolean {
    return this.form.controls.kind.value === 'COMPLEX';
  }

  /** Единицы измерения из настроек (с запасным списком) */
  readonly unitOptions = computed(() =>
    this.settingsService.units().map((u) => ({ label: u, value: u })),
  );

  /** Общая цена комплекса = сумма components[i].price * components[i].qty */
  readonly totalPrice = computed(() =>
    this.components().reduce((sum, c) => sum + c.price * c.qty, 0),
  );

  /** Доступные товары для добавления в комплекс (не COMPLEX, исключая редактируемый) */
  readonly availableProducts = computed(() => {
    const editingId = this.product()?.id;
    const all = this.productService.products().data ?? [];
    return all
      .filter((p) => p.kind !== 'COMPLEX' && p.id !== editingId)
      .map((p) => ({ value: p.id, label: p.name }));
  });

  ngOnInit(): void {
    const product = this.product();
    if (product) {
      this.form.patchValue({
        name: product.name,
        code: product.sku ?? '',
        description: '',
        price: 0,
        unit: 'шт',
        kind: product.kind,
        category: '',
        subcategory: '',
        isActive: product.status === 'active',
      });
      this.onKindChange();
    }
  }

  onCategoryChange(): void {
    const sub = this.form.controls.subcategory;
    const options = this.subcategoryOptions();
    if (sub.value && !options.includes(sub.value)) {
      sub.setValue('');
    }
  }

  onKindChange(): void {
    const unitCtrl = this.form.controls.unit;
    const priceCtrl = this.form.controls.price;

    if (this.isComplex) {
      // Комплекс — цена вычисляется, ед. изм. фиксирована
      unitCtrl.clearValidators();
      unitCtrl.setValue('компл');
      priceCtrl.clearValidators();
      priceCtrl.setValue(0);
    } else {
      // Обычный товар — цена и ед. изм. обязательны
      unitCtrl.setValidators(Validators.required);
      unitCtrl.setValue('');
      priceCtrl.setValidators(Validators.required);
      priceCtrl.setValue(0);
    }
    unitCtrl.updateValueAndValidity();
    priceCtrl.updateValueAndValidity();
  }

  addComponent(): void {
    const productId = this.selectedProductId();
    if (!productId) return;

    const all = this.productService.products().data ?? [];
    const source = all.find((p) => p.id === productId);
    if (!source) return;

    const exists = this.components().some((c) => c.productId === productId);
    if (exists) return;

    this.components.update((list) => [
      ...list,
      {
        productId: source.id,
        name: source.name,
        unit: source.unit,
        price: source.price,
        qty: this.newComponentQty(),
      },
    ]);

    this.selectedProductId.set(null);
    this.newComponentQty.set(1);
  }

  updateComponentQty(index: number, qty: number): void {
    this.components.update((list) => {
      const updated = [...list];
      updated[index] = { ...updated[index], qty };
      return updated;
    });
  }

  removeComponent(index: number): void {
    this.components.update((list) => list.filter((_, i) => i !== index));
  }

  onSave(): void {
    if (this.form.invalid) return;

    const isComplex = this.form.controls.kind.value === 'COMPLEX';
    if (isComplex && this.components().length < 1) return;

    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.saved.emit({
      ...raw,
      images: this.images(),
      price: isComplex ? this.totalPrice() : raw.price,
      unit: isComplex ? 'компл' : raw.unit,
      components: isComplex ? this.components() : [],
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
