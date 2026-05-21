import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { TableRowReorderEvent } from 'primeng/table';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TabsModule } from 'primeng/tabs';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SettingsService } from '../../entities/settings/data-access/settings.service';
import { EntityStatusService } from '../../entities/entity-status/data-access/entity-status.service';
import { ENTITY_STATUS_TYPES } from '../../entities/entity-status/models/entity-status.model';
import type { IEntityStatus } from '../../shared/types/entity-status.interface';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ColorPickerModule,
    ToggleSwitchModule,
    TabsModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <section class="settings-page">
      <h2 class="settings-page__title">Настройки</h2>

      <p-tabs value="general">
        <p-tablist>
          <p-tab value="general">Общие</p-tab>
          <p-tab value="statuses">Статусы</p-tab>
        </p-tablist>

        <!-- ========== ВКЛАДКА: ОБЩИЕ НАСТРОЙКИ ========== -->
        <p-tabpanel value="general">
          @if (loading()) {
            <p>Загрузка…</p>
          } @else {
            <div class="settings-page__grid">
              @for (setting of items(); track setting.key) {
                <p-card [header]="setting.label" class="settings-page__card">
                  <p class="settings-page__desc">{{ setting.description }}</p>
                  <div class="settings-page__control">
                    @if (typeof setting.value === 'boolean') {
                      <p-toggleSwitch [(ngModel)]="setting.value" (onChange)="onSave(setting.key, setting.value)" />
                    } @else if (typeof setting.value === 'number') {
                      <p-inputNumber [(ngModel)]="setting.value" (onBlur)="onSave(setting.key, setting.value)" [style]="{ width: '100%' }" />
                    } @else {
                      <input pInputText [ngModel]="setting.value" (ngModelChange)="onSave(setting.key, $event)" class="settings-page__input" />
                    }
                  </div>
                  <small class="settings-page__key">{{ setting.key }}</small>
                </p-card>
              }
            </div>
          }
        </p-tabpanel>

        <!-- ========== ВКЛАДКА: СТАТУСЫ ========== -->
        <p-tabpanel value="statuses">
          <div class="settings-page__status-header">
            <p-select
              [options]="ENTITY_TYPES"
              optionLabel="label"
              optionValue="value"
              [(ngModel)]="selectedEntityType"
              placeholder="Выберите тип сущности"
              (onChange)="loadStatuses()"
              styleClass="settings-page__type-select"
            />
            <p-button
              label="Добавить статус"
              icon="pi pi-plus"
              [disabled]="!selectedEntityType()"
              (click)="showAddDialog()"
            />
          </div>

          @if (statusLoading()) {
            <p>Загрузка…</p>
          } @else if (statuses().length === 0 && selectedEntityType()) {
            <p class="settings-page__hint">Нет статусов для выбранного типа. Нажмите «Добавить статус».</p>
          } @else {
            <p-table
              [value]="statuses()"
              dataKey="statusId"
              [reorderableColumns]="true"
              (onRowReorder)="onStatusReordered($event)"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th style="width:3rem"></th>
                  <th style="width:120px">Код</th>
                  <th>Название</th>
                  <th style="width:80px">Цвет</th>
                  <th style="width:60px">Нач.</th>
                  <th style="width:60px">Кон.</th>
                  <th style="width:100px">Действия</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-status let-i="rowIndex">
                <tr>
                  <td>
                    <i class="pi pi-bars settings-page__drag-handle"></i>
                  </td>
                  <td>
                    <code class="settings-page__code">{{ status.statusId }}</code>
                  </td>
                  <td>{{ status.label }}</td>
                  <td>
                    <button
                      type="button"
                      class="settings-page__color-swatch"
                      [style.background]="status.color"
                      (click)="editColor(status)"
                      title="Изменить цвет"
                    ></button>
                  </td>
                  <td>
                    @if (status.isInitial) {
                      <i class="pi pi-check-circle" style="color: var(--p-green-500)"></i>
                    }
                  </td>
                  <td>
                    @if (status.isFinal) {
                      <i class="pi pi-check-circle" style="color: var(--p-green-500)"></i>
                    }
                  </td>
                  <td>
                    <div class="settings-page__actions">
                      <p-button
                        icon="pi pi-pencil"
                        [text]="true"
                        [rounded]="true"
                        (click)="editStatus(status)"
                      />
                      <p-button
                        icon="pi pi-trash"
                        [text]="true"
                        [rounded]="true"
                        severity="danger"
                        (click)="confirmDelete(status)"
                      />
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          }
        </p-tabpanel>
      </p-tabs>
    </section>

    <!-- Диалог добавления/редактирования статуса -->
    <p-dialog
      [header]="editingStatus() ? 'Редактировать статус' : 'Новый статус'"
      [modal]="true"
      [visible]="dialogVisible()"
      [style]="{ width: '450px' }"
      (onHide)="closeDialog()"
    >
      @if (formData(); as fd) {
        <div class="settings-page__dialog-form">
          <div class="settings-page__field">
            <span class="settings-page__label">Код *</span>
            <input
              pInputText
              [ngModel]="fd.statusId"
              (ngModelChange)="updateForm('statusId', $event)"
              [disabled]="!!editingStatus()"
              class="settings-page__input"
              placeholder="new_status"
            />
          </div>
          <div class="settings-page__field">
            <span class="settings-page__label">Название *</span>
            <input
              pInputText
              [ngModel]="fd.label"
              (ngModelChange)="updateForm('label', $event)"
              class="settings-page__input"
              placeholder="Новый статус"
            />
          </div>
          <div class="settings-page__field">
            <span class="settings-page__label">Цвет</span>
            <p-colorPicker
              [ngModel]="fd.color"
              (ngModelChange)="updateForm('color', $event)"
              inline="true"
            />
          </div>
          <div class="settings-page__row">
            <div class="settings-page__switch-group">
              <p-toggleSwitch
                [ngModel]="fd.isInitial"
                (ngModelChange)="updateForm('isInitial', $event)"
                inputId="dlg-isInitial"
              />
              <label class="settings-page__switch-label" for="dlg-isInitial">Начальный</label>
            </div>
            <div class="settings-page__switch-group">
              <p-toggleSwitch
                [ngModel]="fd.isFinal"
                (ngModelChange)="updateForm('isFinal', $event)"
                inputId="dlg-isFinal"
              />
              <label class="settings-page__switch-label" for="dlg-isFinal">Конечный</label>
            </div>
          </div>
        </div>
      }
      <ng-template pTemplate="footer">
        <p-button label="Отмена" severity="secondary" (click)="closeDialog()" />
        <p-button
          [label]="editingStatus() ? 'Сохранить' : 'Создать'"
          [disabled]="!formValid()"
          (click)="saveStatusFromDialog()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .settings-page { padding: 1rem 0; }
    .settings-page__title { margin: 0 0 1.5rem; font-size: 22px; font-weight: 700; }
    .settings-page__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; }
    .settings-page__desc { font-size: 0.875rem; color: #64748b; margin: 0 0 0.75rem; }
    .settings-page__control { margin-bottom: 0.5rem; }
    .settings-page__input { width: 100%; }
    .settings-page__key { font-family: monospace; font-size: 0.75rem; color: #94a3b8; }
    .settings-page__hint { color: #64748b; font-size: 0.875rem; margin-top: 1rem; }

    /* Status tab */
    .settings-page__status-header { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem; }
    .settings-page__type-select { min-width: 250px; }
    .settings-page__drag-handle { cursor: grab; color: #94a3b8; }
    .settings-page__code { font-size: 0.8rem; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
    .settings-page__color-swatch { display: inline-block; width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e2e8f0; cursor: pointer; }
    .settings-page__actions { display: flex; gap: 0.25rem; }
    .settings-page__dialog-form { display: flex; flex-direction: column; gap: 1rem; }
    .settings-page__field { display: flex; flex-direction: column; gap: 0.25rem; }
    .settings-page__label { font-weight: 600; font-size: 0.875rem; }
    .settings-page__row { display: flex; gap: 1.5rem; }
    .settings-page__switch-group { display: flex; align-items: center; gap: 0.5rem; }
    .settings-page__switch-label { font-size: 0.875rem; cursor: pointer; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  private readonly settingsSvc = inject(SettingsService);
  private readonly statusSvc = inject(EntityStatusService);
  private readonly msg = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  protected readonly ENTITY_TYPES = ENTITY_STATUS_TYPES;

  // ---- Общие настройки ----
  private readonly rs = this.settingsSvc.items;
  readonly loading = computed(() => this.rs().loading);
  readonly items = computed(() => this.rs().data);

  onSave(key: string, value: unknown): void {
    this.settingsSvc.update(key, value).pipe(
      catchError((err: Error) => {
        this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
        return of(undefined);
      }),
    ).subscribe(() => {
      this.msg.add({ severity: 'success', summary: 'Сохранено', detail: `Настройка «${key}» обновлена` });
    });
  }

  // ---- Статусы ----
  readonly selectedEntityType = signal<string | null>(null);
  readonly statuses = signal<IEntityStatus[]>([]);
  readonly statusLoading = signal(false);

  loadStatuses(): void {
    const et = this.selectedEntityType();
    if (!et) return;

    this.statusLoading.set(true);
    this.statusSvc.getByEntityType(et).pipe(
      catchError((err: Error) => {
        this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
        return of([] as IEntityStatus[]);
      }),
    ).subscribe((data) => {
      this.statuses.set(data);
      this.statusLoading.set(false);
    });
  }

  onStatusReordered(event: TableRowReorderEvent): void {
    const dragIndex = event.dragIndex ?? 0;
    const dropIndex = event.dropIndex ?? 0;
    const et = this.selectedEntityType();
    if (!et) return;

    const list = [...this.statuses()];
    const [moved] = list.splice(dragIndex, 1);
    list.splice(dropIndex, 0, moved);

    // Обновляем sortOrder
    const updated = list.map((s, i) => ({ ...s, sortOrder: i }));
    this.statuses.set(updated);

    // Сохраняем новый порядок
    for (const s of updated) {
      this.statusSvc.update(et, s.statusId, { sortOrder: s.sortOrder }).pipe(
        catchError(() => of(null)),
      ).subscribe();
    }
  }

  // ---- Диалог добавления/редактирования ----
  readonly dialogVisible = signal(false);
  readonly editingStatus = signal<IEntityStatus | null>(null);
  readonly formData = signal<{
    statusId: string;
    label: string;
    color: string;
    isInitial: boolean;
    isFinal: boolean;
  } | null>(null);

  readonly formValid = computed(() => {
    const fd = this.formData();
    return !!fd && fd.statusId.trim().length > 0 && fd.label.trim().length > 0;
  });

  showAddDialog(): void {
    this.editingStatus.set(null);
    this.formData.set({
      statusId: '',
      label: '',
      color: '#607D8B',
      isInitial: false,
      isFinal: false,
    });
    this.dialogVisible.set(true);
  }

  editStatus(status: IEntityStatus): void {
    this.editingStatus.set(status);
    this.formData.set({
      statusId: status.statusId,
      label: status.label,
      color: status.color,
      isInitial: status.isInitial,
      isFinal: status.isFinal,
    });
    this.dialogVisible.set(true);
  }

  updateForm(field: string, value: unknown): void {
    this.formData.update((fd) => (fd ? { ...fd, [field]: value } : fd));
  }

  editColor(status: IEntityStatus): void {
    // Заглушка — при клике на цвет открывает диалог
    this.editStatus(status);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.editingStatus.set(null);
    this.formData.set(null);
  }

  saveStatusFromDialog(): void {
    const et = this.selectedEntityType();
    const fd = this.formData();
    if (!et || !fd) return;

    const data: Partial<IEntityStatus> = {
      entityType: et,
      statusId: fd.statusId,
      label: fd.label,
      color: fd.color || '#607D8B',
      icon: 'pi pi-circle',
      isInitial: fd.isInitial,
      isFinal: fd.isFinal,
    };

    const obs = this.editingStatus()
      ? this.statusSvc.update(et, fd.statusId, data)
      : this.statusSvc.create(data);

    obs.pipe(
      catchError((err: Error) => {
        this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
        return of(null);
      }),
    ).subscribe((result) => {
      if (result) {
        this.msg.add({
          severity: 'success',
          summary: this.editingStatus() ? 'Сохранено' : 'Создано',
          detail: `Статус «${fd.label}» ${this.editingStatus() ? 'обновлён' : 'создан'}`,
        });
        this.closeDialog();
        this.loadStatuses();
      }
    });
  }

  confirmDelete(status: IEntityStatus): void {
    const et = this.selectedEntityType();
    if (!et) return;

    this.confirm.confirm({
      message: `Удалить статус «${status.label}»?`,
      header: 'Подтверждение',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      accept: () => {
        this.statusSvc.remove(et, status.statusId).pipe(
          catchError((err: Error) => {
            this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
            return of(undefined);
          }),
        ).subscribe(() => {
          this.msg.add({ severity: 'success', summary: 'Удалено', detail: `Статус «${status.label}» удалён` });
          this.loadStatuses();
        });
      },
    });
  }
}
