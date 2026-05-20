import { ChangeDetectionStrategy, Component, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { Product } from '../../models/product.model';
import { ProductKind } from '../../models/product.model';

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
}

/** Преобразует массив URL в текст (по одному URL на строку) */
function imagesToString(images: string[]): string {
  return images.join('\n');
}

/** Преобразует текст (по одному URL на строке) в массив */
function stringToImages(value: string): string[] {
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    ToggleSwitchModule,
    ButtonModule,
  ],
  template: `
    <p-dialog
      [header]="product() ? 'Редактировать товар' : 'Новый товар'"
      [modal]="true"
      [visible]="true"
      [style]="{ width: '640px' }"
      (onHide)="onCancel()"
    >
      <form [formGroup]="form" class="product-form">
        <div class="product-form__field">
          <label class="product-form__label" for="name">Название *</label>
          <input id="name" pInputText formControlName="name" class="product-form__input" />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <small class="product-form__error">Обязательное поле</small>
          }
        </div>

        <div class="product-form__row">
          <div class="product-form__field">
            <label class="product-form__label" for="code">Артикул</label>
            <input id="code" pInputText formControlName="code" class="product-form__input" />
          </div>

          <div class="product-form__field">
            <label class="product-form__label" for="unit">Ед. изм. *</label>
            <input id="unit" pInputText formControlName="unit" class="product-form__input" />
            @if (form.get('unit')?.invalid && form.get('unit')?.touched) {
              <small class="product-form__error">Обязательное поле</small>
            }
          </div>
        </div>

        <div class="product-form__field">
          <label class="product-form__label" for="description">Описание *</label>
          <textarea id="description" pTextarea formControlName="description" class="product-form__input" rows="3"></textarea>
          @if (form.get('description')?.invalid && form.get('description')?.touched) {
            <small class="product-form__error">Обязательное поле</small>
          }
        </div>

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
            <label class="product-form__label" for="kind">Тип *</label>
          <p-select
            id="kind"
            formControlName="kind"
            [options]="kindOptions"
            optionLabel="label"
            optionValue="value"
            [style]="{ width: '100%' }"
          />
          </div>
        </div>

        <div class="product-form__row">
          <div class="product-form__field">
            <label class="product-form__label" for="category">Категория</label>
            <input id="category" pInputText formControlName="category" class="product-form__input" />
          </div>

          <div class="product-form__field">
            <label class="product-form__label" for="subcategory">Подкатегория</label>
            <input id="subcategory" pInputText formControlName="subcategory" class="product-form__input" />
          </div>
        </div>

        <div class="product-form__field">
          <label class="product-form__label" for="images">Изображения (по одному URL на строку)</label>
          <textarea id="images" pTextarea formControlName="images" class="product-form__input" rows="3"></textarea>
        </div>

        <div class="product-form__field product-form__switch">
          <p-toggleSwitch formControlName="isActive" inputId="isActive" />
          <label class="product-form__label" for="isActive">Активен</label>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button label="Отмена" severity="secondary" (click)="onCancel()" />
        <p-button
          [label]="product() ? 'Сохранить' : 'Создать'"
          [disabled]="form.invalid || form.pristine"
          (click)="onSave()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
    .product-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .product-form__row {
      display: flex;
      gap: 1rem;
    }
    .product-form__row > .product-form__field {
      flex: 1;
    }
    .product-form__field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .product-form__label {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--p-text-color);
    }
    .product-form__input {
      width: 100%;
    }
    .product-form__error {
      color: var(--p-red-500);
      font-size: 0.75rem;
    }
    .product-form__switch {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
    }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly product = input<Product | null>(null);
  readonly saved = output<ProductFormValue>();
  readonly cancelled = output<void>();

  readonly kindOptions = [
    { value: 'ITEM' as ProductKind, label: 'Товар' },
    { value: 'SERVICE' as ProductKind, label: 'Услуга' },
    { value: 'WORK' as ProductKind, label: 'Работа' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    code: [''],
    description: ['', Validators.required],
    price: [0, Validators.required],
    unit: ['', Validators.required],
    kind: ['ITEM' as ProductKind, Validators.required],
    images: [''],
    category: [''],
    subcategory: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    const product = this.product();
    if (product) {
      this.form.patchValue({
        name: product.name,
        code: product.code ?? '',
        description: product.description,
        price: product.price,
        unit: product.unit,
        kind: product.kind,
        images: imagesToString(product.images ?? []),
        category: product.category ?? '',
        subcategory: product.subcategory ?? '',
        isActive: product.isActive,
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.saved.emit({
      ...raw,
      images: stringToImages(raw.images),
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
