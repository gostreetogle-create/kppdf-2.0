# @notification-specialist

Уведомления (SSE + Notification) — Фаза 7.

## Зона ответственности

| Область | Описание |
|---------|----------|
| SSE | Server-Sent Events endpoint /notifications/sse |
| Notification | CRUD уведомлений, read/unread |
| Push | Отправка при изменении статуса заказа, назначении задачи, утверждении материалов |

## Контракты

- SSE endpoint требует `authenticate`
- Уведомление создаётся в момент бизнес-события (статус changed и т.д.)
- На фронте: `EventSource` в `NotificationService`
- `isRead` — toggle через `PATCH /notifications/:id/read`

## Запрещено

- Использовать WebSocket (только SSE)
- Хранить SSE-соединения в памяти без очистки при disconnect
