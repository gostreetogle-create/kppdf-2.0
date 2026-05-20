# UI-библиотека: PrimeNG + Aura + PrimeIcons

## Выбор

Мы используем **PrimeNG v21** в качестве основной UI-библиотеки.

| Компонент | Назначение |
|-----------|------------|
| `primeng` | UI-компоненты (таблицы, кнопки, формы, диалоги) |
| `@primeuix/themes` | Пресеты тем (Aura, Material, Lara, Nora) |
| `primeicons` | Иконки Prime |

Тема **Aura** — современная, минималистичная, светло-серая. Это пресет по умолчанию.

## Установка

```bash
npm install primeng @primeuix/themes primeicons
```

## Настройка

### 1. `angular.json`

Добавить **только PrimeIcons** (тема Aura подключается через JS):

```json
"styles": [
  "node_modules/primeicons/primeicons.css",
  "src/styles.scss"
]
```

⚠️ В PrimeNG v21 **не нужно** добавлять `primeng/resources/themes/...` — тема внедряется программно.

### 2. `app.config.ts`

```typescript
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... остальные провайдеры
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false, // отключаем тёмную тему
        },
      },
    }),
  ],
};
```

## Импорт компонентов

PrimeNG v21 — все компоненты Standalone. Импортируй напрямую:

```typescript
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

@Component({
  standalone: true,
  imports: [ButtonModule, InputTextModule, TableModule, DialogModule],
})
```

## Как использовать

### Кнопки

```html
<p-button label="Сохранить" icon="pi pi-check" severity="primary" />
<p-button label="Удалить" icon="pi pi-trash" severity="danger" [outlined]="true" />
<p-button label="Загружается…" [loading]="true" />
```

### Формы

```html
<!-- PrimeNG v21 использует p-inputtext как директиву -->
<input pInputText id="name" [(ngModel)]="name" placeholder="Название" />

<!-- Float label (раньше был p-float-label, теперь iftalabel) -->
<p-iftalabel>
  <input pInputText id="name" [(ngModel)]="name" />
  <label for="name">Название</label>
</p-iftalabel>
```

### Таблицы

```html
<p-table [value]="products" [paginator]="true" [rows]="10">
  <ng-template pTemplate="header">
    <tr>
      <th>Название</th>
      <th>Цена</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-product>
    <tr>
      <td>{{ product.name }}</td>
      <td>{{ product.price }}</td>
    </tr>
  </ng-template>
</p-table>
```

### Модальные окна

```html
<p-dialog [(visible)]="visible" header="Редактирование" [modal]="true">
  <p>Содержимое</p>
  <ng-template pTemplate="footer">
    <p-button label="Отмена" severity="secondary" (click)="visible = false" />
    <p-button label="Сохранить" (click)="save()" />
  </ng-template>
</p-dialog>
```

## Интеграция с BEM

PrimeNG-компоненты используют свои классы, **но** наш SCSS/BEM остаётся для:

1. **Layout** (обёртки, контейнеры, секции) — `.layout`, `.dashboard`, `.login`
2. **Специфические стили** там, где PrimeNG-компонент обёрнут в наш блок
3. **Переопределение** — через CSS custom properties в `styles.scss`

```scss
// ✅ Обёртка для PrimeNG-компонента с BEM
.product-form {
  &__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
```

## Кастомизация темы

Тему можно переопределить через `definePreset`:

```typescript
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },
});

providePrimeNG({
  theme: {
    preset: MyPreset,
  },
});
```

## Запрещено

- Использовать PrimeNG-компоненты **без импорта** соответствующего модуля
- Лепить BEM-классы **внутрь** PrimeNG-компонента (они не поддерживают BEM)
- Добавлять `primeng/resources/themes/*.css` в `angular.json` (v21 не использует CSS-темы)
- Использовать PrimeNG без `provideAnimationsAsync()` (сломаются анимации)

## Структура shared/ui с PrimeNG

`shared/ui/` остаётся для **обёрток над PrimeNG** или для компонентов, которых нет в PrimeNG:

```
shared/ui/
├── page-header/      # обёртка: заголовок + breadcrumb + actions
├── confirm-dialog/   # обёртка над p-confirmDialog
└── empty-state/      # кастомный компонент (нет в PrimeNG)
```
