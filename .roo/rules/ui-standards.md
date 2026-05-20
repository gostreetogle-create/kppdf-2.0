# UI-компоненты: Стандарты

## Standalone

- Все компоненты, директивы и пайпы — **Standalone**.
- Никаких `NgModule`. Если нужна группировка — используй массив `imports` прямо в компоненте.

```typescript
@Component({
  selector: 'app-my-button',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './my-button.component.html',
  styleUrls: ['./my-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

## Change Detection

- **Всегда `OnPush`** — `ChangeDetectionStrategy.OnPush`.
- Не вызывай `markForCheck()` или `detectChanges()` вручную. Signals сами триггерят обновление.
- Если используешь `async` pipe, убедись, что Observable обновляется корректно.

## Стили: SCSS + BEM

- **Никогда** не используй `style:` inline.
- SCSS — обязателен. Стилизация в отдельном файле `*.component.scss`.
- **BEM** (Block__Element--Modifier) — строгий стандарт именования классов.

```scss
// ✅ Правильно
.my-button {
  display: inline-flex;

  &__icon {
    margin-right: 8px;
  }

  &--primary {
    background: var(--color-primary);
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

// ❌ Неправильно
.myButton {
  display: inline-flex; // camelCase
}

.my-button_icon {
  margin-right: 8px; // не BEM
}
```

- Глобальные переменные (цвета, отступы, шрифты) — в `src/styles/` или через CSS custom properties (`:root`).
- Избегай глубокой вложенности SCSS (максимум 3-4 уровня).

## Dumb-компоненты (shared/ui)

- **Никакой бизнес-логики.**
- Получают данные через `input()` / `input.required()`.
- Отдают события через `output()`.
- Не импортируют сервисы из `entities/` или `features/`.
- Не имеют доступа к store, API, роутеру.

```typescript
// ✅ Пример Dumb-компонента
@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="button button--{{variant}}" [disabled]="disabled">
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'ghost'>('primary');
  readonly disabled = input(false);
  readonly clicked = output<MouseEvent>();
}

// ❌ Пример с нарушением — импорт сервиса в shared/ui
```

## Smart-компоненты (features, pages)

- Содержат логику: вызов сервисов, работу с состоянием.
- Могут импортировать Dumb-компоненты из `shared/ui/`.
- Могут импортировать сервисы из `entities/` и `core/`.

## Именование

- Файлы: `kebab-case` (`my-button.component.ts`, `user-card.component.ts`).
- Селекторы: префикс `app-` → `app-user-card`.
- Классы: `PascalCase` → `UserCardComponent`.
- Папки: `kebab-case` (`user-card/`, `create-deal/`).