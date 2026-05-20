import { ChangeDetectionStrategy, Component, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Kp } from '../../models/kp.model';
import type { KpStatus, KpType } from '../../../../shared/types/kp.interface';

export interface KpFormValue {
  title: string;
  kpType: KpType;
  status: KpStatus;
  recipientName: string;
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
        <div class="kp-form__field">
          <label class="kp-form__label" for="title">Название *</label>
          <input id="title" pInputText formControlName="title" class="kp-form__input" />
        </div>
        <div class="kp-form__row">
          <div class="kp-form__field">
            <label class="kp-form__label" for="kpType">Тип *</label>
            <p-select id="kpType" formControlName="kpType" [options]="typeOptions" [style]="{ width: '100%' }" />
          </div>
          <div class="kp-form__field">
            <label class="kp-form__label" for="status">Статус</label>
            <p-select id="status" formControlName="status" [options]="statusOptions" [style]="{ width: '100%' }" />
          </div>
        </div>
        <div class="kp-form__field">
          <label class="kp-form__label" for="recipientName">Получатель *</label>
          <input id="recipientName" pInputText formControlName="recipientName" class="kp-form__input" placeholder="Название организации" />
        </div>
        <div class="kp-form__row">
          <div class="kp-form__field">
            <label class="kp-form__label" for="number">Номер *</label>
            <input id="number" pInputText formControlName="number" class="kp-form__input" placeholder="КП-001" />
          </div>
          <div class="kp-form__field">
            <label class="kp-form__label" for="validityDays">Дней действия</label>
            <p-inputNumber id="validityDays" formControlName="validityDays" [min]="1" class="kp-form__input" />
          </div>
        </div>
        <div class="kp-form__field">
          <label class="kp-form__label" for="vatPercent">НДС, %</label>
          <p-inputNumber id="vatPercent" formControlName="vatPercent" [min]="0" [max]="100" class="kp-form__input" />
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly kp = input<Kp | null>(null);
  readonly saved = output<KpFormValue>();
  readonly cancelled = output<void>();

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
    title: ['', Validators.required],
    kpType: ['standard' as KpType, Validators.required],
    status: ['draft' as KpStatus],
    recipientName: ['', Validators.required],
    number: ['', Validators.required],
    validityDays: [30],
    vatPercent: [0],
  });

  ngOnInit(): void {
    const item = this.kp();
    if (item) {
      this.form.patchValue({
        title: item.title,
        kpType: item.kpType,
        status: item.status,
        recipientName: item.recipient?.name ?? '',
        number: item.metadata?.number ?? '',
        validityDays: item.metadata?.validityDays ?? 30,
        vatPercent: item.vatPercent,
      });
    }
  }

  onSave(): void { if (this.form.invalid) return; this.saved.emit(this.form.getRawValue()); }
  onCancel(): void { this.cancelled.emit(); }
}
