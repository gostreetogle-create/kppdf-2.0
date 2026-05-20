import { Pipe, PipeTransform } from '@angular/core';
import { ProductKind } from '../../models/product.model';

const LABELS: Record<ProductKind, string> = {
  ITEM: 'Товар',
  SERVICE: 'Услуга',
  WORK: 'Работа',
};

@Pipe({
  name: 'productKindLabel',
  standalone: true,
})
export class ProductKindLabelPipe implements PipeTransform {
  transform(value: ProductKind | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    return LABELS[value] ?? value;
  }
}
