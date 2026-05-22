import { computed, inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { Setting } from '../models/setting.model';
import { ApiService, ApiError } from '../../../core/api/api.service';
import { ResourceState, initialResourceState } from '../../../shared/utils/resource-state';
import type { ISetting } from '../../../shared/types/settings.interface';

/** Значения по умолчанию для настроек */
export const DEFAULT_UNITS = ['шт', 'м', 'кг', 'л', 'усл.', 'компл', 'м²', 'м³', 'уп.', 'пач.', 'рул.', 'лист'];

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api = inject(ApiService);
  private readonly _refresh$ = new BehaviorSubject<void>(undefined);

  private readonly _items: Signal<ResourceState<Setting[]>> = toSignal(
    this._refresh$.pipe(
      switchMap(() =>
        this.api.get<ISetting[]>('/settings').pipe(
          map((res): ResourceState<Setting[]> => ({
            loading: false, error: null,
            data: (res.data ?? []).map((s) => new Setting(s)),
          })),
          catchError((err: ApiError) =>
            of({ loading: false, error: err.message ?? 'Ошибка загрузки', data: [] as Setting[] }),
          ),
          startWith(initialResourceState<Setting[]>([])),
        ),
      ),
    ),
    { initialValue: initialResourceState<Setting[]>([]) },
  );
  readonly items: Signal<ResourceState<Setting[]>> = this._items;
  reload(): void { this._refresh$.next(); }

  /** Получить значение настройки по ключу */
  getByKey(key: string): Signal<string | undefined> {
    return computed(() => {
      const state = this._items();
      const setting = state.data?.find((s) => s.key === key);
      return setting ? String(setting.value) : undefined;
    });
  }

  /** Единицы измерения — из настройки product_units, с запасным списком */
  readonly units: Signal<string[]> = computed(() => {
    const state = this._items();
    const setting = state.data?.find((s) => s.key === 'product_units');
    if (!setting) return DEFAULT_UNITS;
    const raw = String(setting.value);
    try { return JSON.parse(raw); }
    catch { return raw.split(',').map((s: string) => s.trim()).filter(Boolean); }
  });

  /** Категории товаров — из настройки product_categories */
  readonly categories: Signal<CategoryDef[]> = computed(() => {
    const state = this._items();
    const setting = state.data?.find((s) => s.key === 'product_categories');
    if (!setting) return DEFAULT_CATEGORIES;
    const raw = String(setting.value);
    try { return JSON.parse(raw); }
    catch { return DEFAULT_CATEGORIES; }
  });

  update(key: string, value: unknown): Observable<void> {
    return this.api.patch('/settings', key, { value }).pipe(map(() => { this.reload(); }));
  }
}

export interface SubcategoryDef {
  id: string;
  name: string;
}

export interface CategoryDef {
  id: string;
  name: string;
  subcategories: SubcategoryDef[];
}

/** Сгенерировать короткий URL-safe ID из названия */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40);
}

const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'oborudovanie', name: 'Оборудование', subcategories: [
    { id: 'stanki', name: 'Станки' }, { id: 'instrument', name: 'Инструмент' }, { id: 'izmeritelnoe', name: 'Измерительное' },
    { id: 'kompressory', name: 'Компрессоры' }, { id: 'nasosy', name: 'Насосы' }, { id: 'prochee-oborud', name: 'Прочее' },
  ]},
  { id: 'raskhodnye-materialy', name: 'Расходные материалы', subcategories: [
    { id: 'kantselyariya', name: 'Канцелярия' }, { id: 'khoztovary', name: 'Хозтовары' }, { id: 'smazochnye', name: 'Смазочные материалы' },
    { id: 'filtry', name: 'Фильтры' }, { id: 'prochee-raskh', name: 'Прочее' },
  ]},
  { id: 'uslugi', name: 'Услуги', subcategories: [
    { id: 'montazh', name: 'Монтаж' }, { id: 'naladka', name: 'Наладка' }, { id: 'remont', name: 'Ремонт' },
    { id: 'obsluzhivanie', name: 'Обслуживание' }, { id: 'konsultatsiya', name: 'Консультация' }, { id: 'prochee-usl', name: 'Прочее' },
  ]},
  { id: 'programmnoe-obespechenie', name: 'Программное обеспечение', subcategories: [
    { id: 'litsenzii', name: 'Лицензии' }, { id: 'podpiski', name: 'Подписки' }, { id: 'razrabotka', name: 'Разработка' },
    { id: 'integratsiya', name: 'Интеграция' }, { id: 'prochee-po', name: 'Прочее' },
  ]},
  { id: 'prochee', name: 'Прочее', subcategories: [
    { id: 'prochee-proch', name: 'Прочее' },
  ]},
];
