import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../models/product.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { ProductKindLabelPipe } from '../product-kind-label/product-kind-label.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [PricePipe, ProductKindLabelPipe],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly clicked = output<Product>();
}