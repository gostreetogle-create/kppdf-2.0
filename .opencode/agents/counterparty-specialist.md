# Counterparty Specialist

## Описание
Эксперт по домену **Контрагентов**. Отвечает за клиентов/поставщиков/наши компании, DaData, INN/KPP валидацию, branding templates.

## Domain knowledge
- `shared/types/counterparty.interface.ts` — ICounterparty, CounterpartyRole, branding templates
- `backend/src/modules/counterparty/` — бэкенд-логика
- `src/app/entities/counterparty/` — фронтенд-сущности

## Правила
- Единая сущность с `roles[]` (client/supplier/company)
- `isOurCompany` — флаг нашей компании-инициатора
- `isDefaultInitiator` — одна компания по умолчанию
- INN: 10 или 12 цифр (для юрлиц/ИП)
- КПП: 9 цифр (только для юрлиц)
- Для `Физлицо` — упрощённая форма, ИНН опционально
- BrandingTemplates — несколько шаблонов по kpType, один `isDefault`
- При сохранении snapshot в КП — immutable
- DaData lookup по ИНН (опционально, требует токена)

## Границы
- Не изменяет логику КП (только данные для snapshot)
- Не лезет в товары и авторизацию
