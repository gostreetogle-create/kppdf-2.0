import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';
import { API_BASE_URL } from '../../../core/api.config';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  function makeProduct(overrides: Partial<Product> = {}): Product {
    return new Product({
      _id: '1',
      name: 'Товар 1',
      description: 'Описание',
      price: 100,
      unit: 'шт',
      kind: 'ITEM' as const,
      images: [],
      isActive: true,
      ...overrides,
    });
  }

  const mockProducts = [
    makeProduct({ _id: '1', name: 'Товар 1' }),
    makeProduct({ _id: '2', name: 'Услуга 1', kind: 'SERVICE' }),
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

  /** Сбросить initial GET запрос списка, который триггерится при создании сервиса */
  function flushInitialGet(): void {
    httpMock.expectOne(`${API_BASE_URL}/products`).flush({ data: [] });
  }

  afterEach(() => {
    try {
      httpMock.expectOne(`${API_BASE_URL}/products`).flush({ data: [] });
    } catch {
      // no pending request — OK
    }
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    flushInitialGet();
  });

  it('should load products and update state', () => {
    service.products(); // trigger signal

    const req = httpMock.expectOne(`${API_BASE_URL}/products`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockProducts });

    const state = service.products();
    expect(state.loading).toBeFalse();
    expect(state.error).toBeNull();
    expect(state.data.length).toBe(2);
    expect(state.data[0]._id).toBe('1');
    expect(state.data[0].name).toBe('Товар 1');
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

  it('should create product', () => {
    flushInitialGet();
    const newProduct = makeProduct({ _id: '3', name: 'Новый товар' });

    service.create({ name: 'Новый товар' }).subscribe((p) => {
      expect(p._id).toBe('3');
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/products`);
    expect(req.request.method).toBe('POST');
    req.flush({ data: newProduct });
  });

  it('should update product', () => {
    flushInitialGet();
    const updated = makeProduct({ name: 'Обновлённый товар' });

    service.update('1', { name: 'Обновлённый товар' }).subscribe((p) => {
      expect(p.name).toBe('Обновлённый товар');
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/products/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ data: updated });
  });

  it('should delete product', () => {
    flushInitialGet();

    service.delete('1').subscribe(() => {
      // success — no error
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/products/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
