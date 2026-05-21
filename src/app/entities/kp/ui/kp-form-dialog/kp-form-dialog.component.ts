import { ChangeDetectionStrategy, Component, computed, inject, input, output, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Kp } from '../../models/kp.model';
import { KpService } from '../../data-access/kp.service';
import { CounterpartyService } from '../../../counterparty/data-access/counterparty.service';
import type { KpStatus, KpType } from '../../../../shared/types/kp.interface';

export interface KpFormValue {
  title: string;
  kpType: KpType;
  status: KpStatus;
  recipientId: string | null;
  number: string;
  validityDays: number;
  vatPercent: number;
}

@Component({
  selector: 'app-kp-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, InputTextModule, InputNumberModule, SelectModule, ButtonModule],
  template: `
    <p-dialog
      [header]="kp() ? 'Редактировать КП' : 'Новое КП'"
      [modal]="true"
      [visible]="true"
      [style]="{ width: '500px' }"
      (onHide)="onCancel()"
    >
      <form [formGroup]="form" class="kp-form">
        <!-- Номер КП — авто-генерируется бэкендом -->
        <div class="kp-form__field">
          <span class="kp-form__label">Номер КП</span>
          @if (kp()) {
            <span class="kp-form__number">{{ kp()!.metadata.number }}</span>
          } @else {
            <span class="kp-form__number kp-form__number--pending">{{ nextNumber() || 'Загрузка...' }}</span>
          }
        </div>

        <div class="kp-form__row">
          <div class="kp-form__field">
            <label class="kp-form__label" for="kpType">Тип *</label>
            <p-select id="kpType" formControlName="kpType" [options]="typeOptions" [style]="{ width: '100%' }" appendTo="body" />
          </div>
          <div class="kp-form__field">
            <label class="kp-form__label" for="status">Статус</label>
            <p-select id="status" formControlName="status" [options]="statusOptions" [style]="{ width: '100%' }" appendTo="body" />
          </div>
        </div>

        <div class="kp-form__field">
          <label class="kp-form__label" for="recipientId">Получатель *</label>
          <p-select
            id="recipientId"
            formControlName="recipientId"
            [options]="counterpartyOptions()"
            [filter]="true"
            [showClear]="true"
            placeholder="Выберите контрагента..."
            optionLabel="label"
            optionValue="value"
            [style]="{ width: '100%' }"
            appendTo="body"
          />
        </div>

        <div class="kp-form__row">
          <div class="kp-form__field">
            <label class="kp-form__label" for="validityDays">Дней действия</label>
            <p-inputNumber id="validityDays" formControlName="validityDays" [min]="1" class="kp-form__input" />
          </div>
          <div class="kp-form__field">
            <label class="kp-form__label" for="vatPercent">НДС, %</label>
            <p-inputNumber id="vatPercent" formControlName="vatPercent" [min]="0" [max]="100" class="kp-form__input" />
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button label="Отмена" severity="secondary" (click)="onCancel()" />
        <p-button [label]="kp() ? 'Сохранить' : 'Создать'" [disabled]="form.invalid" (click)="onSave()" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .kp-form { display: flex; flex-direction: column; gap: 0.75rem; }
    .kp-form__row { display: flex; gap: 0.75rem; }
    .kp-form__field { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
    .kp-form__label { font-weight: 600; font-size: 0.875rem; }
    .kp-form__input { width: 100%; }
    .kp-form__number { font-size: 1.1rem; font-weight: 700; color: var(--p-primary-color); padding: 0.25rem 0; }
    .kp-form__number--pending { color: var(--p-text-muted-color); font-weight: 400; font-size: 0.875rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly kpService = inject(KpService);
  private readonly counterpartyService = inject(CounterpartyService);

  readonly kp = input<Kp | null>(null);
  readonly saved = output<KpFormValue>();
  readonly cancelled = output<void>();

  private readonly counterpartyState = this.counterpartyService.items;
  readonly nextNumber = signal<string>('');

  readonly counterpartyOptions = computed(() => {
    const state = this.counterpartyState();
    return (state.data ?? []).map((c) => ({
      value: c._id,
      label: c.inn ? `${c.name} (${c.inn})` : c.name,
    }));
  });

  readonly typeOptions = [
    { value: 'standard' as KpType, label: 'Стандартное' },
    { value: 'response' as KpType, label: 'Ответ на запрос' },
    { value: 'special' as KpType, label: 'Спецпредложение' },
    { value: 'tender' as KpType, label: 'Тендер' },
    { value: 'service' as KpType, label: 'Услуга' },
  ];
  readonly statusOptions = [
    { value: 'draft' as KpStatus, label: 'Черновик' },
    { value: 'sent' as KpStatus, label: 'Отправлено' },
    { value: 'accepted' as KpStatus, label: 'Принято' },
    { value: 'rejected' as KpStatus, label: 'Отклонено' },
  ];

  readonly form = this.fb.nonNullable.group({
    kpType: ['standard' as KpType, Validators.required],
    status: ['draft' as KpStatus],
    recipientId: [null as string | null, Validators.required],
    validityDays: [30],
    vatPercent: [0],
  });

  ngOnInit(): void {
    const item = this.kp();
    if (item) {
      // Режим редактирования — показываем существующий номер
      this.form.patchValue({
        kpType: item.kpType,
        status: item.status,
        recipientId: item.counterpartyId ?? null,
        validityDays: item.metadata?.validityDays ?? 30,
        vatPercent: item.vatPercent,
      });
    } else {
      // Режим создания — запрашиваем следующий номер
      this.kpService.getNextNumber().subscribe({
        next: (num) => this.nextNumber.set(num),
        error: () => this.nextNumber.set('КП-001'),
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const number = this.kp()?.metadata.number ?? this.nextNumber();
    this.saved.emit({ ...raw, title: number, number });
  }
  onCancel(): void { this.cancelled.emit(); }
}
