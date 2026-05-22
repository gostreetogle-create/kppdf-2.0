import { computed, inject, Injectable, signal } from '@angular/core';
import { DocumentTemplateService } from '../../../entities/document-template/data-access/document-template.service';
import { DocumentService } from '../../../entities/document/data-access/document.service';
import { ApiService } from '../../../core/api/api.service';
import type { IDocument, IDocumentTemplate, IDocumentPage, IOverlayDef } from '../../../shared/types/document.types';
import { MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentEditorService {
  private readonly templateSvc = inject(DocumentTemplateService);
  private readonly docSvc = inject(DocumentService);
  private readonly api = inject(ApiService);
  private readonly msg = inject(MessageService);

  // ─── Состояние ─────────────────────────────────────────────

  private readonly _template = signal<IDocumentTemplate | null>(null);
  readonly template = this._template.asReadonly();

  private readonly _document = signal<IDocument | null>(null);
  readonly document = this._document.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _currentPage = signal(1);
  readonly currentPage = this._currentPage.asReadonly();

  readonly totalPages = computed(() => {
    const pages = this._document()?.pages ?? this._template()?.pages ?? [];
    return pages.length;
  });

  readonly currentPageDef = computed<IDocumentPage | null>(() => {
    const pages = this._document()?.pages ?? this._template()?.pages ?? [];
    return pages.find((p) => p.pageNumber === this._currentPage()) ?? null;
  });

  readonly backgroundImage = computed(() => {
    return this.currentPageDef()?.backgroundImage ?? this._template()?.backgroundImage ?? '';
  });

  /** Загрузить шаблоны для типа и создать документ */
  loadForEntity(entityType: string, entityId: string): void {
    this._loading.set(true);

    this.templateSvc.getByType(entityType);

    // Загружаем entity данные через API
    this.api.get<Record<string, unknown>>(`/${entityType}/${entityId}`).subscribe({
      next: (entityRes) => {
        const entity = entityRes.data as Record<string, unknown>;
        if (!entity) {
          this.msg.add({ severity: 'error', summary: 'Ошибка', detail: 'Сущность не найдена' });
          this._loading.set(false);
          return;
        }

        // Берём первый шаблон этого типа
        this.templateSvc.templates().length === 0 && this.templateSvc.getByType(entityType);
        const template = this.templateSvc.templates()[0];

        if (!template) {
          this.msg.add({ severity: 'warn', summary: 'Нет шаблона', detail: `Нет шаблона для типа «${entityType}»` });
          this._loading.set(false);
          return;
        }

        // Создаём документ на бэкенде
        this.docSvc.create({ templateId: template.id, entityType: entityType as any, entityId }).pipe(
          catchError((err) => {
            this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
            this._loading.set(false);
            return of(null);
          }),
        ).subscribe((docRes) => {
          if (docRes?.data) {
            this._document.set(docRes.data);
            this._template.set(template);
            this._currentPage.set(1);
          }
          this._loading.set(false);
        });
      },
      error: (err) => {
        this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err.message ?? 'Не удалось загрузить данные' });
        this._loading.set(false);
      },
    });
  }

  /** Загрузить существующий документ по ID */
  loadDocument(id: string): void {
    this._loading.set(true);
    this.docSvc.getById(id);
    const doc = this.docSvc.currentDoc();
    if (doc) {
      this._document.set(doc);
      this._currentPage.set(1);
      // Загружаем шаблон
      this.templateSvc.getById(doc.templateId);
    }
    this._loading.set(false);
  }

  navigatePage(page: number): void {
    const max = this.totalPages();
    if (page >= 1 && page <= max) {
      this._currentPage.set(page);
    }
  }

  finalize(): void {
    const doc = this._document();
    if (!doc || doc.status !== 'draft') return;

    this.docSvc.finalize(doc.id).pipe(
      catchError((err) => {
        this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
        return of(null);
      }),
    ).subscribe((res) => {
      if (res?.data) {
        this._document.set(res.data);
        this.msg.add({ severity: 'success', summary: 'Заморожено', detail: 'Документ финализирован, редактирование заблокировано' });
      }
    });
  }

  reset(): void {
    this._document.set(null);
    this._template.set(null);
    this._currentPage.set(1);
  }
}
