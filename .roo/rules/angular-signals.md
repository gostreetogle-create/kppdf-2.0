# Angular 21+ Signals & TypeScript Rules

## Signals API

- **`input()` / `input.required()`** — всегда используй для входных параметров компонента. `input.required()` — если параметр обязателен.
- **`output()`** — для событий наружу. Всегда типизируй: `output<MyEventType>()`.
- **`signal()`** — внутреннее реактивное состояние.
- **`computed()`** — производные значения, только чистые функции без сайд-эффектов.
- **`effect()`** — только для отладки или интеграции с внешними API (localStorage, log). **Не используй для синхронизации состояния.**

## Строгая типизация

- **`any` запрещён.** Нигде. Ни в параметрах, ни в возвращаемых типах, ни в дженериках.
- Если нужна гибкость — используй `unknown` с последующей гардовой проверкой.
- Все модели данных — интерфейсы с чёткими полями.
- Шаблоны: `Partial<T>`, `Pick<T, K>`, `Omit<T, K>` — только когда это необходимо для конкретного варианта использования.

## Dependency Injection

- Только `inject()` — **никакого constructor DI**.
- Порядок: сначала `inject()`-вызовы, затем поля `signal()`/`computed()`, затем остальная логика.

```typescript
// ✅ Правильно
export class MyService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(MyStore);

  readonly items$ = this.http.get<Item[]>(API_URL);
}

// ❌ Неправильно
export class MyService {
  constructor(private http: HttpClient) {} // constructor DI запрещён
}
```

## RxJS

- RxJS — только для HTTP (`HttpClient`) и потоков внешних событий.
- Если данные можно выразить через `signal()` + `computed()` — **не используй RxJS**.
- При конвертации Observable → Signal используй `toSignal()`:

```typescript
readonly items = toSignal(this.http.get<Item[]>(API_URL), { initialValue: [] });
```

## Readonly

- Экспортируемые `signal()` и `computed()` всегда оборачивай в `asReadonly()`:

```typescript
// В сервисе:
private readonly _count = signal(0);
readonly count = this._count.asReadonly();