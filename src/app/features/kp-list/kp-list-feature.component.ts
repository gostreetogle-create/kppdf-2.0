import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Kp, KpStatus } from '../../entities/kp/models/kp.model';
import { KpService } from '../../entities/kp/data-access/kp.service';
import { KpFormDialogComponent, KpFormValue } from '../../entities/kp/ui/kp-form-dialog/kp-form-dialog.component';
import { CounterpartyService } from '../../entities/counterparty/data-access/counterparty.service';
import { KpStatusLabelPipe, KpTypeLabelPipe } from '../../shared/pipes/kp.pipe';
import type { IKpRecipientSnapshot } from '../../shared/types/kp.interface';

@Component({
  selector: 'app-kp-list-feature',
  standalone: true,
  imports: [DecimalPipe, TableModule, ButtonModule, TagModule, ConfirmDialogModule, ToastModule, TooltipModule, InputTextModule, KpFormDialogComponent, KpStatusLabelPipe, KpTypeLabelPipe],
  providers: [ConfirmationService, MessageService],
  templateUrl: './kp-list-feature.component.html',
  styleUrls: ['./kp-list-feature.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpListFeatureComponent {
  private readonly service = inject(KpService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  private readonly resourceState = this.service.items;
  readonly loading = computed(() => this.resourceState().loading);
  readonly items = computed(() => this.resourceState().data);

  readonly showDialog = signal(false);
  readonly editingItem = signal<Kp | null>(null);

  onCreate(): void { this.editingItem.set(null); this.showDialog.set(true); }
  onEdit(item: Kp): void { this.editingItem.set(item); this.showDialog.set(true); }

  private buildRecipientFromCounterparty(counterpartyId: string): IKpRecipientSnapshot {
    const state = this.counterpartyService.items();
    const c = (state.data ?? []).find((cp) => cp._id === counterpartyId);
    if (!c) return { name: 'Неизвестный контрагент' };

    return {
      name: c.name,
      shortName: c.shortName,
      legalForm: c.legalForm,
      inn: c.inn,
      kpp: c.kpp,
      ogrn: c.ogrn,
      legalAddress: c.legalAddress,
      phone: c.phone,
      email: c.email,
      bankName: c.bankName,
      bik: c.bik,
      checkingAccount: c.checkingAccount,
      correspondentAccount: c.correspondentAccount,
    };
  }

  onSave(value: KpFormValue): void {
    const item = this.editingItem();
    const recipient = value.recipientId
      ? this.buildRecipientFromCounterparty(value.recipientId)
      : { name: '' };

    const payload = {
      title: value.title,
      kpType: value.kpType,
      status: value.status,
      vatPercent: value.vatPercent,
      counterpartyId: value.recipientId ?? undefined,
      recipient,
      metadata: { number: value.number, validityDays: value.validityDays, prepaymentPercent: 50, productionDays: 30 },
      companySnapshot: { companyId: '', companyName: 'Моя компания', templateKey: 'default', templateName: 'По умолчанию', kpType: value.kpType, assets: { kpPage1: '' }, texts: {} },
      items: [],
      conditions: [],
    };

    const request$ = item ? this.service.update(item.id, payload) : this.service.create(payload);
    request$.pipe(
      map(() => true),
      catchError((err: Error) => { this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }); return of(false); }),
    ).subscribe((ok) => {
      if (ok) { this.showDialog.set(false); this.messageService.add({ severity: 'success', summary: 'Готово', detail: item ? 'КП обновлено' : 'КП создано' }); }
    });
  }

  onCancelDialog(): void { this.showDialog.set(false); }

  onDelete(item: Kp): void {
    this.confirmationService.confirm({
      message: `Удалить КП «${item.title}»?`,
      header: 'Подтверждение', icon: 'pi pi-exclamation-triangle',
      accept: () => this.service.delete(item.id).subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'Готово', detail: 'КП удалено' }),
        error: (err: Error) => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }),
      }),
    });
  }

  statusSeverity(s: KpStatus): 'info' | 'success' | 'warn' | 'danger' | 'contrast' {
    const map: Record<KpStatus, 'info' | 'success' | 'warn' | 'danger' | 'contrast'> = { draft: 'info', sent: 'warn', accepted: 'success', rejected: 'danger' };
    return map[s];
  }
}
