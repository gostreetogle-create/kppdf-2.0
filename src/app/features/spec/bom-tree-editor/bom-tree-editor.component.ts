import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeModule, TreeNode } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import type { IComponentNode, BOMNodeType } from '@shared/types/bom.types';

/** Преобразует IComponentNode в TreeNode для p-tree */
function toTreeNode(node: IComponentNode): TreeNode {
  return {
    key: node.id,
    label: `${node.marking || ''} ${node.name}`.trim(),
    data: node,
    type: node.type,
    children: node.children?.map(toTreeNode) ?? [],
    expanded: true,
    leaf: !node.children || node.children.length === 0,
  };
}

/** Преобразует TreeNode обратно в IComponentNode */
function fromTreeNode(tn: TreeNode): IComponentNode {
  return tn.data as IComponentNode;
}

@Component({
  selector: 'app-bom-tree-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TreeModule, ButtonModule, InputTextModule,
    InputNumberModule, SelectModule, CardModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="bom-editor">
      <div class="bom-editor__toolbar">
        <p-button
          label="Добавить деталь"
          icon="pi pi-plus"
          severity="secondary"
          (click)="addChild()"
          [disabled]="!selectedNode()"
        />
        <p-button
          label="Добавить узел"
          icon="pi pi-folder-plus"
          severity="secondary"
          (click)="addAssembly()"
          [disabled]="!selectedNode()"
        />
        <p-button
          label="Удалить"
          icon="pi pi-trash"
          severity="danger"
          (click)="removeNode()"
          [disabled]="!selectedNode()"
        />
      </div>

      <div class="bom-editor__content">
        <div class="bom-editor__tree">
          <p-tree
            [value]="treeNodes()"
            selectionMode="single"
            [(selection)]="selectedNode"
            (onNodeSelect)="onSelect($event.node)"
            class="w-full"
          />
        </div>

        @if (selectedNodeData(); as node) {
          <div class="bom-editor__properties">
            <p-card header="Свойства узла">
              <div class="bom-editor__prop-grid">
                <label>Маркировка</label>
                <input pInputText [(ngModel)]="node.marking" />

                <label>Наименование</label>
                <input pInputText [(ngModel)]="node.name" />

                <label>Тип</label>
                <p-select
                  [options]="nodeTypes"
                  [(ngModel)]="node.type"
                  styleClass="w-full"
                />

                <label>Материал</label>
                <input pInputText [(ngModel)]="node.material" placeholder="Текстовое описание" />

                <label>Количество</label>
                <p-inputNumber [(ngModel)]="node.qty" />

                <label>Ед. изм.</label>
                <input pInputText [(ngModel)]="node.unit" />

                @if (node.costPerUnit !== undefined) {
                  <label>Себест. ед.</label>
                  <p-inputNumber [(ngModel)]="node.costPerUnit" [min]="0" />
                }
              </div>
            </p-card>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .bom-editor {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      &__toolbar {
        display: flex;
        gap: 0.5rem;
        padding: 0.5rem;
        background: var(--p-surface-ground);
        border-radius: var(--p-border-radius);
      }

      &__content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      &__properties {
        .bom-editor__prop-grid {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 0.5rem;
          align-items: center;

          label {
            font-weight: 600;
            font-size: 0.875rem;
            color: var(--p-text-muted-color);
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BomTreeEditorComponent {
  readonly nodeTypes: BOMNodeType[] = ['assembly', 'part', 'purchased', 'process'];

  /** Корневой узел BOM-дерева */
  readonly bom = input.required<IComponentNode>();

  /** Событие при изменении дерева */
  readonly bomChange = output<IComponentNode>();

  /** Базовый ID для генерации новых узлов */
  private nextId = 100;

  /** Selected node in tree (ngModel binding) */
  selectedNode: TreeNode | null = null;

  /** Данные выбранного узла */
  selectedNodeData = () => (this.selectedNode?.data as IComponentNode) ?? null;

  /** Нода для p-tree */
  treeNodes = () => [toTreeNode(this.bom())];

  onSelect(node: TreeNode): void {
    this.selectedNode = node;
  }

  addChild(): void {
    const parent = this.selectedNode?.data as IComponentNode;
    if (!parent) return;
    if (!parent.children) parent.children = [];

    const child: IComponentNode = {
      id: `new_${this.nextId++}`,
      parentId: parent.id,
      type: 'part',
      marking: '',
      name: 'Новая деталь',
      qty: 1,
      unit: 'шт',
      material: '',
      status: 'design',
    };

    parent.children.push(child);
    this.emitChange();
  }

  addAssembly(): void {
    const parent = this.selectedNode?.data as IComponentNode;
    if (!parent) return;
    if (!parent.children) parent.children = [];

    const assembly: IComponentNode = {
      id: `new_${this.nextId++}`,
      parentId: parent.id,
      type: 'assembly',
      marking: '',
      name: 'Новый узел',
      qty: 1,
      unit: 'шт',
      status: 'design',
    };

    parent.children.push(assembly);
    this.emitChange();
  }

  removeNode(): void {
    const node = this.selectedNode?.data as IComponentNode;
    if (!node) return;
    this.removeFromTree(this.bom(), node.id);
    this.selectedNode = null;
    this.emitChange();
  }

  private removeFromTree(root: IComponentNode, id: string): boolean {
    if (!root.children) return false;
    const idx = root.children.findIndex(c => c.id === id);
    if (idx !== -1) {
      root.children.splice(idx, 1);
      return true;
    }
    for (const child of root.children) {
      if (this.removeFromTree(child, id)) return true;
    }
    return false;
  }

  private emitChange(): void {
    this.bomChange.emit(this.bom());
  }
}
