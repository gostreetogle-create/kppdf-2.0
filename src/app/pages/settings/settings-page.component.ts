import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SettingsService } from '../../entities/settings/data-access/settings.service';
import { CardModule } from 'primeng/card';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [FormsModule, CardModule, TableModule, ButtonModule, InputTextModule, InputNumberModule, ToggleSwitchModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <section class="settings-page">
      <h2 class="settings-page__title">Настройки</h2>

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
    </section>
  `,
  styles: [`
    .settings-page { padding: 1rem 0; }
    .settings-page__title { margin: 0 0 1.5rem; font-size: 22px; font-weight: 700; }
    .settings-page__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; }
    .settings-page__desc { font-size: 0.875rem; color: #64748b; margin: 0 0 0.75rem; }
    .settings-page__control { margin-bottom: 0.5rem; }
    .settings-page__input { width: 100%; }
    .settings-page__key { font-family: monospace; font-size: 0.75rem; color: #94a3b8; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  private readonly service = inject(SettingsService);
  private readonly msg = inject(MessageService);

  private readonly rs = this.service.items;
  readonly loading = computed(() => this.rs().loading);
  readonly items = computed(() => this.rs().data);

  onSave(key: string, value: unknown): void {
    this.service.update(key, value).pipe(
      catchError((err: Error) => {
        this.msg.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
        return of(undefined);
      }),
    ).subscribe(() => {
      this.msg.add({ severity: 'success', summary: 'Сохранено', detail: `Настройка «${key}» обновлена` });
    });
  }
}
