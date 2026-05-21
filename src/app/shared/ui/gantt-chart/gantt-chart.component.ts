import {
  AfterViewInit,
  Component,
  ElementRef,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  viewChild,
  OnDestroy,
} from '@angular/core';
import Gantt from 'frappe-gantt';
import type { GanttTask, GanttOptions } from 'frappe-gantt';

@Component({
  selector: 'app-gantt-chart',
  standalone: true,
  template: `<div #ganttContainer class="gantt-chart__container"></div>`,
  styles: [`
    .gantt-chart__container {
      width: 100%;
      overflow-x: auto;
      ::ng-deep .gantt { width: 100%; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GanttChartComponent implements AfterViewInit, OnDestroy {
  private readonly elRef = inject(ElementRef);

  readonly tasks = input<GanttTask[]>([]);
  readonly options = input<GanttOptions>({});
  readonly taskClick = output<GanttTask>();
  readonly dateChange = output<{ task: GanttTask; start: Date; end: Date }>();
  readonly progressChange = output<{ task: GanttTask; progress: number }>();

  readonly ganttContainer = viewChild<ElementRef<HTMLDivElement>>('ganttContainer');

  private ganttInstance: Gantt | null = null;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnDestroy(): void {
    this.ganttInstance = null;
  }

  private render(): void {
    const container = this.ganttContainer()?.nativeElement;
    if (!container) return;

    const currentTasks = this.tasks();
    if (currentTasks.length === 0) {
      container.innerHTML = '<div class="gantt-chart__empty">Нет данных для отображения</div>';
      return;
    }

    const opts: GanttOptions = {
      view_mode: 'Day',
      date_format: 'YYYY-MM-DD',
      language: 'ru',
      on_click: (task) => this.taskClick.emit(task),
      on_date_change: (task, start, end) => this.dateChange.emit({ task, start, end }),
      on_progress_change: (task, progress) => this.progressChange.emit({ task, progress }),
      ...this.options(),
    };

    this.ganttInstance = new Gantt(container, currentTasks, opts);
  }
}
