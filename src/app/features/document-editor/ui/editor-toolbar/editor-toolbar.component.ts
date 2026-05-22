import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  imports: [ButtonModule, ToolbarModule, TooltipModule],
  templateUrl: './editor-toolbar.component.html',
  styleUrls: ['./editor-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorToolbarComponent {
  readonly docTitle = input<string>('');
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(1);
  readonly status = input<string>('draft');
  readonly canSave = input<boolean>(false);

  readonly pageChange = output<number>();
  readonly save = output<void>();
  readonly finalize = output<void>();
  readonly back = output<void>();
}
