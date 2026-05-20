import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [CardModule],
  template: `
    <div class="placeholder">
      <p-card>
        <div class="placeholder__content">
          <i class="pi pi-spinner pi-spin placeholder__icon"></i>
          <h2 class="placeholder__title">{{ title() }}</h2>
          <p class="placeholder__text">Страница в разработке</p>
        </div>
      </p-card>
    </div>
  `,
  styles: [
    `
    .placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
    }
    .placeholder__content {
      text-align: center;
      padding: 2rem;
    }
    .placeholder__icon {
      font-size: 3rem;
      color: var(--p-primary-color);
      margin-bottom: 1rem;
    }
    .placeholder__title {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: var(--p-text-color);
    }
    .placeholder__text {
      color: var(--p-text-muted-color);
    }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly title = toSignal(
    this.route.data.pipe(map((data) => (data['title'] as string) ?? 'Раздел')),
    { initialValue: 'Раздел' },
  );
}
