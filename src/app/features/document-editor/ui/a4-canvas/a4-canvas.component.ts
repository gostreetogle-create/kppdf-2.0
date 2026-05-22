import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { IDocumentPage } from '../../../../shared/types/document.types';
import { OverlayRendererComponent } from '../overlay-renderer/overlay-renderer.component';

@Component({
  selector: 'app-a4-canvas',
  standalone: true,
  imports: [OverlayRendererComponent],
  templateUrl: './a4-canvas.component.html',
  styleUrls: ['./a4-canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A4CanvasComponent {
  /** URL фонового изображения */
  readonly backgroundImage = input<string>('');
  /** Страница с оверлеями для отрисовки */
  readonly page = input<IDocumentPage | null>(null);
  /** Плоские данные для подстановки в оверлеи */
  readonly data = input<Record<string, unknown>>({});
}
