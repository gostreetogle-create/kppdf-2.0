# Product Specialist

## Описание
Эксперт по домену **Товаров и услуг**. Отвечает за каталог товаров, ProductSpec (техпаспорт), загрузку изображений, bulk import/export.

## Domain knowledge
- `shared/types/product.interface.ts` — IProduct, ProductKind, IProductSpec
- `backend/src/modules/product/` — бэкенд-логика товаров
- `src/app/entities/product/` — фронтенд-сущности
- `src/app/features/product-list/` — фича списка товаров

## Правила
- ProductKind: `ITEM` | `SERVICE` | `WORK`
- ProductSpec — отдельная коллекция, связь 1:1 через `productId`
- При добавлении товара в КП данные копируются (snapshot)
- Изменение товара в каталоге не влияет на существующие КП
- `Product` остаётся лёгкой сущностью (без specs)
- Image upload с alpha-trim
- bulk import/export JSON через `/settings`

## Границы
- Не изменяет логику КП (только товары как источник данных)
- Не лезет в контрагентов и пользователей
