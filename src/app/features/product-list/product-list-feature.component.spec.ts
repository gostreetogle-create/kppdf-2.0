import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListFeatureComponent } from './product-list-feature.component';
import { ProductService } from '../../entities/product/data-access/product.service';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ResourceState } from '../../shared/utils/resource-state';
import { Product } from '../../entities/product/models/product.model';
import { ConfirmationService, MessageService } from 'primeng/api';

describe('ProductListFeatureComponent', () => {
  let fixture: ComponentFixture<ProductListFeatureComponent>;
  let component: ProductListFeatureComponent;
  let mockService: jasmine.SpyObj<ProductService>;

  const mockProducts: Product[] = [
    new Product({ _id: '1', name: 'Товар', price: 100, images: [], kind: 'ITEM', unit: 'шт', description: '', isActive: true }),
    new Product({ _id: '2', name: 'Услуга', price: 200, images: [], kind: 'SERVICE', unit: 'усл', description: '', isActive: true }),
    new Product({ _id: '3', name: 'Работа', price: 300, images: [], kind: 'WORK', unit: 'раб', description: '', isActive: true }),
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
    mockService = jasmine.createSpyObj<ProductService>('ProductService', ['create', 'update', 'delete', 'reload'], {
      products: signal(createState()),
    });

    await TestBed.configureTestingModule({
      imports: [ProductListFeatureComponent],
      providers: [
        { provide: ProductService, useValue: mockService },
        ConfirmationService,
        MessageService,
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

  it('should filter products by kind', () => {
    component.selectedKind.set('ITEM');
    fixture.detectChanges();

    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].kind).toBe('ITEM');
  });

  it('should show all products when kind is ALL', () => {
    component.selectedKind.set('ALL');
    fixture.detectChanges();

    expect(component.filteredProducts().length).toBe(3);
  });

  it('should open create dialog', () => {
    component.onCreate();
    expect(component.showDialog()).toBeTrue();
    expect(component.editingProduct()).toBeNull();
  });

  it('should open edit dialog with product', () => {
    component.onEdit(mockProducts[0]);
    expect(component.showDialog()).toBeTrue();
    expect(component.editingProduct()?._id).toBe('1');
  });

  it('should have BEM class product-list-feature', () => {
    const section = fixture.nativeElement.querySelector('.product-list-feature');
    expect(section).toBeTruthy();
  });
});
