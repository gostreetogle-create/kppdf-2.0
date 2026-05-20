import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';
import { API_BASE_URL } from '../../../core/api.config';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProducts: Product[] = [
    { id: '1', name: 'Товар 1', price: 100, images: [], kind: 'ITEM' },
    { id: '2', name: 'Услуга 1', price: 200, images: [], kind: 'SERVICE' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Flush any pending products request triggered by service construction
    try {
      httpMock.expectOne(`${API_BASE_URL}/products`).flush([]);
    } catch {
      // no pending request — OK
    }
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with loading state', () => {
    const state = service.products();
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
    expect(state.data).toEqual([]);
  });

  it('should load products and update state', () => {
    service.products(); // trigger signal

    const req = httpMock.expectOne(`${API_BASE_URL}/products`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);

    const state = service.products();
    expect(state.loading).toBeFalse();
    expect(state.error).toBeNull();
    expect(state.data).toEqual(mockProducts);
  });

  it('should handle HTTP error', () => {
    service.products(); // trigger signal

    const req = httpMock.expectOne(`${API_BASE_URL}/products`);
    req.flush('Ошибка сети', { status: 500, statusText: 'Server Error' });

    const state = service.products();
    expect(state.loading).toBeFalse();
    expect(state.error).toBeTruthy();
    expect(state.data).toEqual([]);
  });

  it('should load product by id', () => {
    TestBed.runInInjectionContext(() => {
      const productSignal = service.getById('1');
      productSignal(); // trigger signal

      const req = httpMock.expectOne(`${API_BASE_URL}/products/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts[0]);

      const state = productSignal();
      expect(state.loading).toBeFalse();
      expect(state.error).toBeNull();
      expect(state.data).toEqual(mockProducts[0]);
    });
  });

  it('should handle error on getById', () => {
    TestBed.runInInjectionContext(() => {
      const productSignal = service.getById('999');
      productSignal(); // trigger signal

      const req = httpMock.expectOne(`${API_BASE_URL}/products/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      const state = productSignal();
      expect(state.loading).toBeFalse();
      expect(state.error).toBeTruthy();
      expect(state.data).toBeUndefined();
    });
  });
});
