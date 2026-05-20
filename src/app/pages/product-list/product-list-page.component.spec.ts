import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListPageComponent } from './product-list-page.component';
import { ProductService } from '../../entities/product/data-access/product.service';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';

describe('ProductListPageComponent', () => {
  let fixture: ComponentFixture<ProductListPageComponent>;

  beforeEach(async () => {
    const mockService = jasmine.createSpyObj<ProductService>('ProductService', [], {
      products: signal({ loading: false, error: null, data: [] }),
    });

    await TestBed.configureTestingModule({
      imports: [ProductListPageComponent],
      providers: [
        { provide: ProductService, useValue: mockService },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListPageComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render product-list-feature inside', () => {
    const featureEl = fixture.nativeElement.querySelector('app-product-list-feature');
    expect(featureEl).toBeTruthy();
  });

  it('should have BEM class product-list-page', () => {
    const mainEl = fixture.nativeElement.querySelector('.product-list-page');
    expect(mainEl).toBeTruthy();
  });
});
