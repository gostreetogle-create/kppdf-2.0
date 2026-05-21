import { ChangeDetectionStrategy, Component, inject, input, model, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../core/api/api.service';

export interface UploadingFile {
  name: string;
  progress: number;
}

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [ButtonModule, ProgressBarModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div
      class="image-uploader"
      (paste)="onPaste($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      tabindex="0"
    >
      <!-- Зона загрузки -->
      <div
        class="image-uploader__dropzone"
        [class.image-uploader__dropzone--drag]="isDragOver()"
        (click)="fileInput.click()"
        (keydown.enter)="fileInput.click()"
        (keydown.space)="fileInput.click()"
        tabindex="0"
        role="button"
      >
        <i class="pi pi-images image-uploader__icon"></i>
        <span class="image-uploader__hint">
          Нажмите для выбора или вставьте из буфера (Ctrl+V)
        </span>
        <span class="image-uploader__formats">PNG, JPG, WebP, GIF, SVG — до 10 МБ</span>
      </div>

      <input
        #fileInput
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        multiple
        (change)="onFilesSelected($event)"
        hidden
      />

      <!-- Прогресс загрузки -->
      @for (upload of uploading(); track upload.name) {
        <div class="image-uploader__progress">
          <span class="image-uploader__progress-name">{{ upload.name }}</span>
          <p-progressBar [value]="upload.progress" [style]="{ height: '6px' }" />
        </div>
      }

      <!-- Превью загруженных изображений -->
      @if (value().length > 0) {
        <div class="image-uploader__previews">
          @for (url of value(); track url; let i = $index) {
            <div class="image-uploader__preview">
              <img [src]="url" class="image-uploader__thumb" alt="" loading="lazy" />
              <button
                type="button"
                class="image-uploader__remove"
                (click)="removeImage(i)"
                title="Удалить"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .image-uploader {
      outline: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .image-uploader__dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      padding: 1.5rem 1rem;
      border: 2px dashed var(--p-surface-300);
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.2s, background-color 0.2s;
      background: var(--p-surface-50);
      min-height: 100px;
    }

    .image-uploader__dropzone:hover,
    .image-uploader__dropzone--drag {
      border-color: var(--p-primary-color);
      background: var(--p-primary-50);
    }

    .image-uploader__icon {
      font-size: 2rem;
      color: var(--p-text-muted-color);
    }

    .image-uploader__hint {
      font-size: 0.875rem;
      color: var(--p-text-color);
      text-align: center;
    }

    .image-uploader__formats {
      font-size: 0.75rem;
      color: var(--p-text-muted-color);
    }

    .image-uploader__progress {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .image-uploader__progress-name {
      font-size: 0.75rem;
      color: var(--p-text-muted-color);
    }

    .image-uploader__previews {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .image-uploader__preview {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid var(--p-surface-200);
    }

    .image-uploader__thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-uploader__remove {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 22px;
      height: 22px;
      border: none;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      opacity: 0;
      transition: opacity 0.15s;
    }

    .image-uploader__preview:hover .image-uploader__remove {
      opacity: 1;
    }

    .image-uploader__remove:hover {
      background: rgba(220, 38, 38, 0.85);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploaderComponent {
  private readonly api = inject(ApiService);
  private readonly messageService = inject(MessageService);

  /** Текущий список URL загруженных изображений */
  readonly value = model<string[]>([]);

  /** Флаг: можно ли удалять с сервера */
  readonly deleteFromServer = input(true);

  /** Файлы в процессе загрузки */
  readonly uploading = signal<UploadingFile[]>([]);

  /** Перетаскивание */
  readonly isDragOver = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFiles(Array.from(files));
    }
  }

  onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          // Даём уникальное имя для вставленного из буфера
          const ext = file.type.split('/')[1] || 'png';
          imageFiles.push(new File([file], `pasted-${Date.now()}.${ext}`, { type: file.type }));
        }
      }
    }

    if (imageFiles.length > 0) {
      event.preventDefault();
      this.uploadFiles(imageFiles);
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFiles(Array.from(input.files));
      input.value = ''; // сброс для повторного выбора того же файла
    }
  }

  removeImage(index: number): void {
    const current = this.value();
    if (index < 0 || index >= current.length) return;

    // Если нужно — удаляем с сервера
    if (this.deleteFromServer()) {
      const url = current[index];
      const filename = url.split('/').pop();
      if (filename) {
        this.api.deleteByPath(`/uploads/${filename}`).subscribe({
          error: () => {
            // Не критично — файл останется на сервере
          },
        });
      }
    }

    const updated = current.filter((_, i) => i !== index);
    this.value.set(updated);
  }

  private uploadFiles(files: File[]): void {
    const validFiles = files.filter((f) => {
      const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (!allowed.includes(f.type)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Пропущен',
          detail: `${f.name}: недопустимый формат`,
        });
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Пропущен',
          detail: `${f.name}: превышает 10 МБ`,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Показываем прогресс
    const uploadingItems: UploadingFile[] = validFiles.map((f) => ({
      name: f.name,
      progress: 0,
    }));
    this.uploading.set(uploadingItems);

    this.api.upload<{ url: string; filename: string; originalName: string; size: number }[]>('/uploads', validFiles).subscribe({
      next: (res) => {
        const newUrls = res.data.map((item) => item.url);
        this.value.update((prev) => [...prev, ...newUrls]);
        this.uploading.set([]);

        this.messageService.add({
          severity: 'success',
          summary: 'Загружено',
          detail: `${newUrls.length} изображений`,
        });
      },
      error: (err) => {
        this.uploading.set([]);
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: err.message ?? 'Не удалось загрузить изображения',
        });
      },
    });
  }
}
