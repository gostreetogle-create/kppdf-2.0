import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import type { IDocument, CreateDocumentDto } from '../models/document.types';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly api = inject(ApiService);

  private readonly _documents = signal<IDocument[]>([]);
  readonly documents = this._documents.asReadonly();

  private readonly _currentDoc = signal<IDocument | null>(null);
  readonly currentDoc = this._currentDoc.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  getAll(type?: string): void {
    this._loading.set(true);
    const params = type ? `?type=${type}` : '';
    this.api.get<IDocument[]>(`/documents${params}`).subscribe({
      next: (res) => {
        this._documents.set(res.data ?? []);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  getById(id: string): void {
    this._loading.set(true);
    this.api.get<IDocument>(`/documents/${id}`).subscribe({
      next: (res) => {
        this._currentDoc.set(res.data ?? null);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  create(data: CreateDocumentDto) {
    return this.api.post<IDocument>('/documents', data);
  }

  updateData(id: string, data: Record<string, unknown>) {
    return this.api.post<IDocument>(`/documents/${id}/data`, data);
  }

  finalize(id: string) {
    return this.api.post<IDocument>(`/documents/${id}/finalize`, {});
  }

  remove(id: string) {
    return this.api.delete('/documents', id);
  }
}
