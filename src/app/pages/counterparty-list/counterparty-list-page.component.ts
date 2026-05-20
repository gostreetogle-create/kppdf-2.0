import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CounterpartyListFeatureComponent } from '../../features/counterparty-list/counterparty-list-feature.component';

@Component({
  selector: 'app-counterparty-list-page',
  standalone: true,
  imports: [CounterpartyListFeatureComponent],
  template: `<app-counterparty-list-feature />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterpartyListPageComponent {}
