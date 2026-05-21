/**
 * Глобальный mongoose-плагин для аудита изменений.
 *
 * Использование:
 *   schema.plugin(auditPlugin);
 *
 * Для передачи userId в контроллере перед save:
 *   doc.$locals.userId = req.user.sub;
 *   doc.$locals.username = req.user.username;
 *   await doc.save();
 */
import { Schema } from 'mongoose';
import { AuditLogModel } from '../../modules/audit-log/audit-log.model';

function computeDiff(
  oldDoc: Record<string, unknown> | null,
  newDoc: Record<string, unknown>,
): Record<string, { old: unknown; new: unknown }> {
  const diff: Record<string, { old: unknown; new: unknown }> = {};

  if (!oldDoc) {
    // Создание — пишем все поля (кроме _id, __v, createdAt)
    for (const [key, val] of Object.entries(newDoc)) {
      if (['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) continue;
      diff[key] = { old: undefined, new: val };
    }
    return diff;
  }

  // Сравнение старого и нового
  const allKeys = new Set([...Object.keys(oldDoc), ...Object.keys(newDoc)]);
  for (const key of allKeys) {
    if (['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) continue;
    const oldVal = oldDoc[key];
    const newVal = newDoc[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[key] = { old: oldVal, new: newVal };
    }
  }

  return diff;
}

export function auditPlugin(schema: Schema): void {
  // После создания/обновления через .save()
  schema.post('save', async function (doc) {
    try {
      const userId = doc.$locals?.userId as string | undefined;
      const username = doc.$locals?.username as string | undefined;
      const action = doc.isNew ? 'CREATED' : ('UPDATED' as const);

      // Для UPDATED нужно предыдущее состояние
      let oldDoc: Record<string, unknown> | null = null;
      if (!doc.isNew) {
        oldDoc = doc.$locals?.__previousData ?? null;
      }

      await AuditLogModel.create({
        entityType: doc.constructor.modelName,
        entityId: doc._id.toString(),
        action,
        userId,
        username,
        diff: computeDiff(oldDoc, doc.toObject()),
        timestamp: new Date(),
      });
    } catch (err) {
      // Плагин не должен блокировать основную операцию
      console.error('[AuditPlugin] Failed to write audit log:', err);
    }
  });

  // Сохраняем предыдущее состояние перед update
  schema.pre('save', function (next) {
    if (!this.isNew) {
      this.$locals.__previousData = this.toObject();
    }
    next();
  });

  // После удаления
  schema.post('deleteOne', async function (doc) {
    try {
      if (!doc) return;
      const userId = (doc as any).$locals?.userId as string | undefined;
      const username = (doc as any).$locals?.username as string | undefined;

      await AuditLogModel.create({
        entityType: doc.constructor.modelName,
        entityId: doc._id.toString(),
        action: 'DELETED',
        userId,
        username,
        diff: {},
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('[AuditPlugin] Failed to write audit log:', err);
    }
  });
}
