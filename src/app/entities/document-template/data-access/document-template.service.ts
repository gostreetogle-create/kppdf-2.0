import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import type { IDocumentTemplate, CreateDocumentTemplateDto } from '../models/document-template.types';

@Injectable({ providedIn: 'root' })
export class DocumentTemplateService {
  private readonly api = inject(ApiService);

  private readonly _templates = signal<IDocumentTemplate[]>([]);
  readonly templates = this._templates.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  getAll(): void {
    this._loading.set(true);
    this.api.get<IDocumentTemplate[]>('/document-templates').subscribe({
      next: (res) => {
        this._templates.set(res.data ?? []);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  getByType(type: string): void {
    this._loading.set(true);
    this.api.get<IDocumentTemplate[]>(`/document-templates/type/${type}`).subscribe({
      next: (res) => {
        this._templates.set(res.data ?? []);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  getById(id: string): void {
    this._loading.set(true);
    this.api.get<IDocumentTemplate>(`/document-templates/${id}`).subscribe({
      next: (res) => {
        this._templates.set(res.data ? [res.data] : []);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  create(data: CreateDocumentTemplateDto) {
    return this.api.post<IDocumentTemplate>('/document-templates', data);
  }

  update(id: string, data: Partial<CreateDocumentTemplateDto>) {
    return this.api.put<IDocumentTemplate>('/document-templates', id, data);
  }

  remove(id: string) {
    return this.api.delete('/document-templates', id);
  }
}
