import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KpListFeatureComponent } from '../../features/kp-list/kp-list-feature.component';

@Component({
  selector: 'app-kp-list-page',
  standalone: true,
  imports: [KpListFeatureComponent],
  template: `<app-kp-list-feature />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpListPageComponent {}
