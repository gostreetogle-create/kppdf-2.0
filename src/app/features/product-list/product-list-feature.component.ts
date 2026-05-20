import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ProductKind } from '../../entities/product/models/product.model';
import { ProductService } from '../../entities/product/data-access/product.service';
import { ProductCardComponent } from '../../entities/product/ui/product-card/product-card.component';

@Component({
  selector: 'app-product-list-feature',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './product-list-feature.component.html',
  styleUrls: ['./product-list-feature.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListFeatureComponent {
  private readonly productService = inject(ProductService);

  readonly selectedKind = signal<ProductKind | 'ALL'>('ALL');
  readonly kinds: { value: ProductKind | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Все' },
    { value: 'ITEM', label: 'Товары' },
    { value: 'SERVICE', label: 'Услуги' },
    { value: 'WORK', label: 'Работы' },
  ];

  private readonly resourceState = this.productService.products;

  readonly loading = computed(() => this.resourceState().loading);
  readonly error = computed(() => this.resourceState().error);
  readonly allProducts = computed(() => this.resourceState().data);

  readonly filteredProducts = computed(() => {
    const kind = this.selectedKind();
    const products = this.allProducts();

    if (kind === 'ALL') {
      return products;
    }

    return products.filter((product) => product.kind === kind);
  });

  readonly isEmpty = computed(() => !this.loading() && this.filteredProducts().length === 0);
  readonly hasFiltered = computed(() => this.selectedKind() !== 'ALL');

  setKind(kind: ProductKind | 'ALL'): void {
    this.selectedKind.set(kind);
  }

  onProductClick(productId: string): void {
    console.log('Product clicked:', productId);
  }
}