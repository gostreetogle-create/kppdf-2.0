import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { Product } from '../../models/product.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { ProductKindLabelPipe } from '../product-kind-label/product-kind-label.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CardModule, TagModule, PricePipe, ProductKindLabelPipe],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly clicked = output<Product>();

  readonly componentCount = computed(() => this.product().components?.length ?? 0);

  readonly componentLabel = computed(() => {
    const n = this.componentCount();
    if (n === 0) return '';
    const word = n === 1 ? 'позиция' : (n < 5 ? 'позиции' : 'позиций');
    return `${n} ${word} в составе`;
  });
}
