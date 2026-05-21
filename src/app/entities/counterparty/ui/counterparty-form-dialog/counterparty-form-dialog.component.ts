import { ChangeDetectionStrategy, Component, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { Counterparty, CounterpartyLegalForm, CounterpartyRole } from '../../models/counterparty.model';

export interface CounterpartyFormValue {
  name: string;
  shortName: string;
  legalForm: CounterpartyLegalForm;
  roles: CounterpartyRole[];
  inn: string;
  kpp: string;
  ogrn: string;
  legalAddress: string;
  phone: string;
  email: string;
  bankName: string;
  bik: string;
  checkingAccount: string;
  correspondentAccount: string;
  founderName: string;
  founderNameShort: string;
  isActive: boolean;
}

@Component({
  selector: 'app-counterparty-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    ToggleSwitchModule,
    ButtonModule,
  ],
  template: `
    <p-dialog
      [header]="counterparty() ? 'Редактировать контрагента' : 'Новый контрагент'"
      [modal]="true"
      [visible]="true"
      [style]="{ width: '700px' }"
      (onHide)="onCancel()"
    >
      <form [formGroup]="form" class="cparty-form">
        <div class="cparty-form__row">
          <div class="cparty-form__field cparty-form__field--grow">
            <label class="cparty-form__label" for="name">Название *</label>
            <input id="name" pInputText formControlName="name" class="cparty-form__input" />
          </div>
          <div class="cparty-form__field">
            <label class="cparty-form__label" for="shortName">Кратко</label>
            <input id="shortName" pInputText formControlName="shortName" class="cparty-form__input" />
          </div>
        </div>

        <div class="cparty-form__row">
          <div class="cparty-form__field">
            <label class="cparty-form__label" for="legalForm">Форма *</label>
            <p-select
              id="legalForm"
              formControlName="legalForm"
              [options]="legalFormOptions"
              [style]="{ width: '100%' }"
              appendTo="body"
            />
          </div>
          <div class="cparty-form__field cparty-form__field--grow">
            <label class="cparty-form__label" for="roles">Роли</label>
            <p-multiSelect
              id="roles"
              formControlName="roles"
              [options]="roleOptions"
              optionLabel="label"
              optionValue="value"
              [style]="{ width: '100%' }"
              placeholder="Выберите роли"
              appendTo="body"
            />
          </div>
        </div>

        <fieldset class="cparty-form__section">
          <legend class="cparty-form__section-title">Реквизиты</legend>
          <div class="cparty-form__row">
            <div class="cparty-form__field">
              <label class="cparty-form__label" for="inn">ИНН</label>
              <input id="inn" pInputText formControlName="inn" class="cparty-form__input" />
            </div>
            <div class="cparty-form__field">
              <label class="cparty-form__label" for="kpp">КПП</label>
              <input id="kpp" pInputText formControlName="kpp" class="cparty-form__input" />
            </div>
            <div class="cparty-form__field">
              <label class="cparty-form__label" for="ogrn">ОГРН</label>
              <input id="ogrn" pInputText formControlName="ogrn" class="cparty-form__input" />
            </div>
          </div>
          <div class="cparty-form__field">
            <label class="cparty-form__label" for="legalAddress">Юр. адрес</label>
            <input id="legalAddress" pInputText formControlName="legalAddress" class="cparty-form__input" />
          </div>
        </fieldset>

        <fieldset class="cparty-form__section">
          <legend class="cparty-form__section-title">Контакты</legend>
          <div class="cparty-form__row">
            <div class="cparty-form__field">
              <label class="cparty-form__label" for="phone">Телефон</label>
              <input id="phone" pInputText formControlName="phone" class="cparty-form__input" />
            </div>
            <div class="cparty-form__field cparty-form__field--grow">
              <label class="cparty-form__label" for="email">Email</label>
              <input id="email" pInputText formControlName="email" class="cparty-form__input" />
            </div>
          </div>
        </fieldset>

        <fieldset class="cparty-form__section">
          <legend class="cparty-form__section-title">Банк</legend>
          <div class="cparty-form__field">
            <label class="cparty-form__label" for="bankName">Банк</label>
            <input id="bankName" pInputText formControlName="bankName" class="cparty-form__input" />
          </div>
          <div class="cparty-form__row">
            <div class="cparty-form__field">
              <label class="cparty-form__label" for="bik">БИК</label>
              <input id="bik" pInputText formControlName="bik" class="cparty-form__input" />
            </div>
            <div class="cparty-form__field cparty-form__field--grow">
              <label class="cparty-form__label" for="checkingAccount">Р/с</label>
              <input id="checkingAccount" pInputText formControlName="checkingAccount" class="cparty-form__input" />
            </div>
            <div class="cparty-form__field cparty-form__field--grow">
              <label class="cparty-form__label" for="correspondentAccount">К/с</label>
              <input id="correspondentAccount" pInputText formControlName="correspondentAccount" class="cparty-form__input" />
            </div>
          </div>
        </fieldset>

        <fieldset class="cparty-form__section">
          <legend class="cparty-form__section-title">Руководитель</legend>
          <div class="cparty-form__row">
            <div class="cparty-form__field cparty-form__field--grow">
              <label class="cparty-form__label" for="founderName">ФИО</label>
              <input id="founderName" pInputText formControlName="founderName" class="cparty-form__input" />
            </div>
            <div class="cparty-form__field">
              <label class="cparty-form__label" for="founderNameShort">Кратко</label>
              <input id="founderNameShort" pInputText formControlName="founderNameShort" class="cparty-form__input" />
            </div>
          </div>
        </fieldset>

        <div class="cparty-form__field cparty-form__switch">
          <p-toggleSwitch formControlName="isActive" inputId="isActive" />
          <label class="cparty-form__label" for="isActive">Активен</label>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button label="Отмена" severity="secondary" (click)="onCancel()" />
        <p-button
          [label]="counterparty() ? 'Сохранить' : 'Создать'"
          [disabled]="form.invalid"
          (click)="onSave()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
    .cparty-form { display: flex; flex-direction: column; gap: 0.75rem; }
    .cparty-form__row { display: flex; gap: 0.75rem; }
    .cparty-form__row > .cparty-form__field { flex: 1; }
    .cparty-form__field--grow { flex: 2 !important; }
    .cparty-form__field { display: flex; flex-direction: column; gap: 0.25rem; }
    .cparty-form__label { font-weight: 600; font-size: 0.875rem; color: var(--p-text-color); }
    .cparty-form__input { width: 100%; }
    .cparty-form__switch { flex-direction: row; align-items: center; gap: 0.5rem; }
    .cparty-form__section { border: 1px solid var(--p-surface-200); border-radius: 6px; padding: 0.75rem; }
    .cparty-form__section-title { font-weight: 700; font-size: 0.875rem; color: var(--p-primary-color); padding: 0 0.5rem; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterpartyFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly counterparty = input<Counterparty | null>(null);
  readonly saved = output<CounterpartyFormValue>();
  readonly cancelled = output<void>();

  readonly legalFormOptions = [
    { value: 'ООО' as CounterpartyLegalForm, label: 'ООО' },
    { value: 'ИП' as CounterpartyLegalForm, label: 'ИП' },
    { value: 'АО' as CounterpartyLegalForm, label: 'АО' },
    { value: 'ПАО' as CounterpartyLegalForm, label: 'ПАО' },
    { value: 'МКУ' as CounterpartyLegalForm, label: 'МКУ' },
    { value: 'Физлицо' as CounterpartyLegalForm, label: 'Физлицо' },
    { value: 'Другое' as CounterpartyLegalForm, label: 'Другое' },
  ];

  readonly roleOptions = [
    { value: 'client' as CounterpartyRole, label: 'Клиент' },
    { value: 'supplier' as CounterpartyRole, label: 'Поставщик' },
    { value: 'company' as CounterpartyRole, label: 'Наша компания' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    shortName: [''],
    legalForm: ['ООО' as CounterpartyLegalForm, Validators.required],
    roles: [['client'] as CounterpartyRole[]],
    inn: [''],
    kpp: [''],
    ogrn: [''],
    legalAddress: [''],
    phone: [''],
    email: [''],
    bankName: [''],
    bik: [''],
    checkingAccount: [''],
    correspondentAccount: [''],
    founderName: [''],
    founderNameShort: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    const cp = this.counterparty();
    if (cp) {
      this.form.patchValue({
        name: cp.name,
        shortName: cp.shortName ?? '',
        legalForm: cp.legalForm,
        roles: cp.roles ?? ['client'],
        inn: cp.inn ?? '',
        kpp: cp.kpp ?? '',
        ogrn: cp.ogrn ?? '',
        legalAddress: cp.legalAddress ?? '',
        phone: cp.phone ?? '',
        email: cp.email ?? '',
        bankName: cp.bankName ?? '',
        bik: cp.bik ?? '',
        checkingAccount: cp.checkingAccount ?? '',
        correspondentAccount: cp.correspondentAccount ?? '',
        founderName: cp.founderName ?? '',
        founderNameShort: cp.founderNameShort ?? '',
        isActive: cp.isActive,
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.saved.emit(this.form.getRawValue());
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
