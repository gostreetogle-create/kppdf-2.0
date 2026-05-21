import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import type { IAttributeDef, IAttributeDefGroup, IAttributeValue } from '@shared/types/attribute.types';

export interface AttributeGroupViewModel {
  title: string;
  attributes: (IAttributeDef & { value: IAttributeValue })[];
}

@Component({
  selector: 'app-dynamic-attr-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    InputNumberModule, SelectModule, InputMaskModule,
    InputSwitchModule, InputTextModule, CardModule,
  ],
  template: `
    <div class="attr-form">
      @for (group of attributeGroups(); track group.title) {
        <p-card [header]="group.title" styleClass="attr-form__group">
          <div class="attr-form__fields">
            @for (attr of group.attributes; track attr.code) {
              <div class="attr-form__field">
                <label class="attr-form__label">
                  {{ attr.name }}
                  @if (attr.unit) { <span class="attr-form__unit">({{ attr.unit }})</span> }
                  @if (attr.isRequired) { <span class="attr-form__required">*</span> }
                </label>

                @switch (attr.valueType) {
                  @case ('number') {
                    <p-inputNumber
                      [(ngModel)]="attr.value.designValue"
                      (ngModelChange)="onAttrChange(attr)"
                      [placeholder]="'Введите ' + attr.name.toLowerCase()"
                    />
                  }
                  @case ('enum') {
                    <p-select
                      [options]="attr.allowedValues"
                      [(ngModel)]="attr.value.designValue"
                      (ngModelChange)="onAttrChange(attr)"
                      [placeholder]="'Выберите ' + attr.name.toLowerCase()"
                      styleClass="w-full"
                    />
                  }
                  @case ('dimension') {
                    <input
                      pInputText
                      [(ngModel)]="attr.value.designValue"
                      (ngModelChange)="onAttrChange(attr)"
                      placeholder="Например: 80х80х3"
                    />
                  }
                  @case ('boolean') {
                    <p-inputSwitch
                      [(ngModel)]="attr.value.designValue"
                      (ngModelChange)="onAttrChange(attr)"
                    />
                  }
                  @case ('range') {
                    <input
                      pInputText
                      [(ngModel)]="attr.value.designValue"
                      (ngModelChange)="onAttrChange(attr)"
                      placeholder="Например: 100-200"
                    />
                  }
                  @default {
                    <input
                      pInputText
                      [(ngModel)]="attr.value.designValue"
                      (ngModelChange)="onAttrChange(attr)"
                      [placeholder]="'Введите ' + attr.name.toLowerCase()"
                    />
                  }
                }
              </div>
            }
          </div>
        </p-card>
      }
    </div>
  `,
  styles: [`
    .attr-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      &__group {
        ::ng-deep .p-card-content {
          padding: 0;
        }
      }

      &__fields {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }

      &__field {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      &__label {
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--p-text-muted-color);
      }

      &__unit {
        font-weight: 400;
        color: var(--p-text-secondary-color);
      }

      &__required {
        color: var(--p-red-500);
        margin-left: 2px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicAttrFormComponent {
  /** Массив групп атрибутов с их определениями и значениями */
  readonly attributeGroups = input.required<AttributeGroupViewModel[]>();

  /** Событие при изменении любого атрибута */
  readonly attrChange = output<{ def: IAttributeDef; value: IAttributeValue }>();

  onAttrChange(attr: IAttributeDef & { value: IAttributeValue }): void {
    this.attrChange.emit({ def: attr, value: attr.value });
  }
}
