import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { Counterparty } from '../../entities/counterparty/models/counterparty.model';
import { CounterpartyService } from '../../entities/counterparty/data-access/counterparty.service';
import {
  CounterpartyFormDialogComponent,
  CounterpartyFormValue,
} from '../../entities/counterparty/ui/counterparty-form-dialog/counterparty-form-dialog.component';

@Component({
  selector: 'app-counterparty-list-feature',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    InputTextModule,
    CounterpartyFormDialogComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './counterparty-list-feature.component.html',
  styleUrls: ['./counterparty-list-feature.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterpartyListFeatureComponent {
  private readonly service = inject(CounterpartyService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly roleLabels: Record<string, string> = {
    client: 'Клиент',
    supplier: 'Поставщик',
    company: 'Наша компания',
  };

  private readonly resourceState = this.service.items;
  readonly loading = computed(() => this.resourceState().loading);
  readonly allItems = computed(() => this.resourceState().data);

  readonly showDialog = signal(false);
  readonly editingItem = signal<Counterparty | null>(null);
  readonly saving = signal(false);

  onCreate(): void {
    this.editingItem.set(null);
    this.showDialog.set(true);
  }

  onEdit(item: Counterparty): void {
    this.editingItem.set(item);
    this.showDialog.set(true);
  }

  onSave(value: CounterpartyFormValue): void {
    this.saving.set(true);
    const item = this.editingItem();

    const request$ = item
      ? this.service.update(item.id, value)
      : this.service.create(value);

    request$.pipe(
      map(() => true),
      catchError((err: Error) => {
        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
        return of(false);
      }),
    ).subscribe((success) => {
      this.saving.set(false);
      if (success) {
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'Готово', detail: item ? 'Контрагент обновлён' : 'Контрагент создан' });
      }
    });
  }

  onCancelDialog(): void {
    this.showDialog.set(false);
  }

  onDelete(item: Counterparty): void {
    this.confirmationService.confirm({
      message: `Удалить контрагента «${item.name}»?`,
      header: 'Подтверждение',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.delete(item.id).subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'Готово', detail: 'Контрагент удалён' }),
          error: (err: Error) => this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message }),
        });
      },
    });
  }

  legalFormColor(legalForm: string): 'info' | 'success' | 'warn' | 'danger' | 'contrast' {
    const map: Record<string, 'info' | 'success' | 'warn' | 'danger' | 'contrast'> = {
      'ООО': 'info', 'ИП': 'success', 'АО': 'warn', 'ПАО': 'danger', 'МКУ': 'contrast',
    };
    return map[legalForm] ?? 'info';
  }
}
