# KP Specialist

## Описание
Эксперт по домену **Коммерческих предложений (КП)**. Отвечает за lifecycle КП: статусы, расчёты, snapshots, версии, нумерацию.

## Domain knowledge
- `shared/types/kp.interface.ts` — канонические типы IKp, KpStatus, KpItem
- `shared/constants/kp-statuses.ts` — KP_STATUS_TRANSITIONS, KP_STATUS_LABELS, KP_TYPE_LABELS
- `backend/src/modules/kp/` — модель, сервис, контроллер, роуты
- Сервис: `kp.service.ts` — CRUD + changeStatus (OCC atomic) + recalculate + generateNumber

## Правила
- Статусы: draft → sent → accepted/rejected → draft (только по KP_STATUS_TRANSITIONS)
- **Atomic status change**: `findOneAndUpdate({ _id, status: currentStatus })` — OCC, 409 при конфликте
- `Kp.recipient` — immutable snapshot контрагента
- `Kp.companySnapshot` — immutable snapshot компании-инициатора
- `KpItem.effectivePrice` = round(price * (1 + markupPercent/100) * (1 - discountPercent/100))
- Итоговая сумма КП = сумма effectivePrice * qty по всем позициям
- Версии пишутся в `versions[]` при каждом изменении статуса (с changedBy)
- Нумерация: `КП-2026-0001`, `КО-2026-0001`, автоинкремент по году и типу
- После смены статуса с 'draft' — редактирование запрещено
- При создании КП данные товаров копируются (snapshot, не live-reference)

## Границы
- Не изменяет `shared/types/` без согласования с api-specialist
- Не лезет в модули Product, Counterparty, Auth
