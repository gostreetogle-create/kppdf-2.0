import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentEditorService } from '../../features/document-editor/data-access/document-editor.service';
import { A4CanvasComponent } from '../../features/document-editor/ui/a4-canvas/a4-canvas.component';
import { EditorToolbarComponent } from '../../features/document-editor/ui/editor-toolbar/editor-toolbar.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-document-editor-page',
  standalone: true,
  imports: [
    A4CanvasComponent,
    EditorToolbarComponent,
    ProgressSpinnerModule,
    MessageModule,
  ],
  templateUrl: './document-editor-page.component.html',
  styleUrls: ['./document-editor-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentEditorPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly editorSvc = inject(DocumentEditorService);

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type');
    const id = this.route.snapshot.queryParamMap.get('id');
    const docId = this.route.snapshot.paramMap.get('id');

    if (docId) {
      // Режим: открыть существующий документ /editor/:id
      this.editorSvc.loadDocument(docId);
    } else if (type && id) {
      // Режим: создать документ из сущности /editor?type=kp&id=kp_123
      this.editorSvc.loadForEntity(type, id);
    }
  }

  onPageChange(page: number): void {
    this.editorSvc.navigatePage(page);
  }

  onSave(): void {
    // В будущем: сохранение текущего состояния
  }

  onFinalize(): void {
    this.editorSvc.finalize();
  }

  onBack(): void {
    const doc = this.editorSvc.document();
    if (doc) {
      this.router.navigate(['/', doc.entityType]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
