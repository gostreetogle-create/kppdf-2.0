import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';
import { Product, ProductKind } from '../../models/product.model';

describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>;
  let component: ProductCardComponent;

  const mockProduct: Product = new Product({
    _id: 'p1',
    name: 'Тестовый товар',
    description: 'Описание',
    price: 1500,
    unit: 'шт',
    images: ['https://example.com/img.jpg'],
    kind: 'ITEM' as ProductKind,
    isActive: true,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display product name', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Тестовый товар');
  });

  it('should display formatted price', () => {
    const priceEl = fixture.nativeElement.querySelector('.product-card__price');
    expect(priceEl).toBeTruthy();
    expect(priceEl.textContent).toMatch(/1[\u00a0 ]500/);
  });

  it('should display product kind label', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Товар');
  });

  it('should render image when images are present', () => {
    const imgEl = fixture.nativeElement.querySelector('.product-card__image');
    expect(imgEl).toBeTruthy();
    expect(imgEl.getAttribute('src')).toBe('https://example.com/img.jpg');
    expect(imgEl.getAttribute('alt')).toBe('Тестовый товар');
  });

  it('should show placeholder when no images', () => {
    fixture.componentRef.setInput('product', new Product({ ...mockProduct, images: [] }));
    fixture.detectChanges();

    const imgEl = fixture.nativeElement.querySelector('.product-card__image');
    const placeholderEl = fixture.nativeElement.querySelector(
      '.product-card__image-placeholder',
    );
    expect(imgEl).toBeFalsy();
    expect(placeholderEl).toBeTruthy();
    expect(placeholderEl.textContent).toContain('Нет изображения');
  });

  it('should emit product on click', () => {
    let emitted: Product | undefined;
    component.clicked.subscribe((p) => (emitted = p));

    const card = fixture.nativeElement.querySelector('.product-card');
    card.click();

    expect(emitted).toEqual(mockProduct);
  });

  it('should apply BEM class product-card', () => {
    const card = fixture.nativeElement.querySelector('.product-card');
    expect(card).toBeTruthy();
  });
});
