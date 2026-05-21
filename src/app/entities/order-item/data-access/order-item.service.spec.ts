import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrderItemService } from './order-item.service';
import { API_BASE_URL } from '../../../core/api.config';

describe('OrderItemService', () => {
  let service: OrderItemService;
  let httpMock: HttpTestingController;

  const mockItems = [
    {
      _id: 'oi-1',
      orderId: 'ord-1',
      snapshot: { name: 'Шкаф металлический', price: 45000, unit: 'шт' },
      quantity: 2,
      totalPrice: 90000,
      kind: 'ITEM',
      section: 'materials',
      sortOrder: 10,
    },
    {
      _id: 'oi-2',
      orderId: 'ord-1',
      snapshot: { name: 'Монтаж', price: 150000, unit: 'усл' },
      quantity: 1,
      totalPrice: 150000,
      kind: 'SERVICE',
      section: 'work',
      sortOrder: 20,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), OrderItemService],
    });
    service = TestBed.inject(OrderItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get items by order id', async () => {
    const getPromise = service.getByOrderId('ord-1');
    const req = httpMock.expectOne(`${API_BASE_URL}/order-items/by-order/ord-1`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockItems });
    const items = await getPromise;

    expect(items.length).toBe(2);
    expect(items[0].snapshot.name).toBe('Шкаф металлический');
    expect(items[0].totalPrice).toBe(90000);
  });

  it('should create order item', async () => {
    const newItem = {
      orderId: 'ord-1',
      snapshot: { name: 'Покраска', price: 30000, unit: 'усл' },
      quantity: 1,
      totalPrice: 30000,
      kind: 'WORK' as const,
      section: 'work' as const,
      sortOrder: 30,
    };
    const createPromise = service.create(newItem);
    const req = httpMock.expectOne(`${API_BASE_URL}/order-items`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.kind).toBe('WORK');
    req.flush({ data: { _id: 'oi-3', ...newItem } });

    const result = await createPromise;
    expect(result._id).toBe('oi-3');
  });

  it('should delete order item', async () => {
    const deletePromise = service.delete('oi-1');
    const req = httpMock.expectOne(`${API_BASE_URL}/order-items/oi-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await deletePromise;
  });

  it('should reorder items', async () => {
    const reorderPromise = service.reorder('ord-1', ['oi-2', 'oi-1']);
    const req = httpMock.expectOne(`${API_BASE_URL}/order-items/reorder/ord-1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.itemIds).toEqual(['oi-2', 'oi-1']);
    req.flush({ ok: true });
    await reorderPromise;
  });

  it('should return empty array for order with no items', async () => {
    const getPromise = service.getByOrderId('ord-empty');
    const req = httpMock.expectOne(`${API_BASE_URL}/order-items/by-order/ord-empty`);
    req.flush({ data: [] });
    const items = await getPromise;
    expect(items).toEqual([]);
  });
});
