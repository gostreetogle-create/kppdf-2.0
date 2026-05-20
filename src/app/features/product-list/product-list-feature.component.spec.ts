import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListFeatureComponent } from './product-list-feature.component';
import { ProductService } from '../../entities/product/data-access/product.service';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ResourceState } from '../../shared/utils/resource-state';
import { Product } from '../../entities/product/models/product.model';

describe('ProductListFeatureComponent', () => {
  let fixture: ComponentFixture<ProductListFeatureComponent>;
  let component: ProductListFeatureComponent;
  let mockService: jasmine.SpyObj<ProductService>;

  const mockProducts: Product[] = [
    { id: '1', name: 'Товар', price: 100, images: [], kind: 'ITEM' },
    { id: '2', name: 'Услуга', price: 200, images: [], kind: 'SERVICE' },
    { id: '3', name: 'Работа', price: 300, images: [], kind: 'WORK' },
  ];

  function createState(overrides: Partial<ResourceState<Product[]>> = {}): ResourceState<Product[]> {
    return {
      loading: false,
      error: null,
      data: mockProducts,
      ...overrides,
    };
  }

  beforeEach(async () => {
    mockService = jasmine.createSpyObj<ProductService>('ProductService', [], {
      products: signal(createState()),
    });

    await TestBed.configureTestingModule({
      imports: [ProductListFeatureComponent],
      providers: [
        { provide: ProductService, useValue: mockService },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render product cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('app-product-card');
    expect(cards.length).toBe(3);
  });

  it('should filter products by kind', () => {
    component.setKind('ITEM');
    fixture.detectChanges();

    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].kind).toBe('ITEM');
  });

  it('should show all products when kind is ALL', () => {
    component.setKind('ALL');
    fixture.detectChanges();

    expect(component.filteredProducts().length).toBe(3);
  });

  it('should show loading state', () => {
    const loadingState = signal(createState({ loading: true, data: [] }));
    Object.defineProperty(mockService, 'products', { get: () => loadingState });

    fixture = TestBed.createComponent(ProductListFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('.product-list-feature__loading');
    expect(loadingEl).toBeTruthy();
  });

  it('should show error state', () => {
    const errorState = signal(createState({ loading: false, error: 'Ошибка загрузки', data: [] }));
    Object.defineProperty(mockService, 'products', { get: () => errorState });

    fixture = TestBed.createComponent(ProductListFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.product-list-feature__error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Ошибка загрузки');
  });

  it('should show empty state when no products match filter', () => {
    const emptyState = signal(createState({ data: [] }));
    Object.defineProperty(mockService, 'products', { get: () => emptyState });

    fixture = TestBed.createComponent(ProductListFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const emptyEl = fixture.nativeElement.querySelector('.product-list-feature__empty');
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.textContent).toContain('Список товаров пуст');
  });

  it('should have BEM class product-list-feature', () => {
    const section = fixture.nativeElement.querySelector('.product-list-feature');
    expect(section).toBeTruthy();
  });
});
