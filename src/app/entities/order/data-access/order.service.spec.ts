import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrderService } from './order.service';
import { API_BASE_URL } from '../../../core/api.config';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  const mockOrders = [
    {
      _id: 'ord-1',
      number: 'ORDER-20260521-001',
      statusId: 'draft',
      counterpartyName: 'ООО Тест',
      totalSum: 150000,
      priority: 'normal',
      description: 'Тестовый заказ',
      createdAt: '2026-05-21T10:00:00Z',
    },
    {
      _id: 'ord-2',
      number: 'ORDER-20260521-002',
      statusId: 'confirmed',
      counterpartyName: 'АО Пример',
      totalSum: 280000,
      priority: 'high',
      description: 'Срочный заказ',
      createdAt: '2026-05-21T11:00:00Z',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OrderService,
      ],
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load all orders', async () => {
    const loadPromise = service.loadAll();
    const req = httpMock.expectOne(`${API_BASE_URL}/orders`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockOrders });
    await loadPromise;

    expect(service.list().length).toBe(2);
    expect(service.list()[0].number).toBe('ORDER-20260521-001');
  });

  it('should load orders with filters', async () => {
    const loadPromise = service.loadAll({ priority: 'high' });
    const req = httpMock.expectOne(`${API_BASE_URL}/orders?priority=high`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [mockOrders[1]] });
    await loadPromise;

    expect(service.list().length).toBe(1);
    expect(service.list()[0].priority).toBe('high');
  });

  it('should get order by id', async () => {
    const getPromise = service.getById('ord-1');
    const req = httpMock.expectOne(`${API_BASE_URL}/orders/ord-1`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockOrders[0] });
    const order = await getPromise;

    expect(order.number).toBe('ORDER-20260521-001');
    expect(order.counterpartyName).toBe('ООО Тест');
  });

  it('should create order', async () => {
    const newOrder = { counterpartyName: 'Новый клиент', description: 'Новый заказ', items: [] };
    const createPromise = service.create(newOrder);

    // First request is GET for items (called after create)
    const createReq = httpMock.expectOne(`${API_BASE_URL}/orders`);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body.counterpartyName).toBe('Новый клиент');
    createReq.flush({ data: { order: { _id: 'ord-3', ...newOrder, number: 'ORDER-20260521-003', totalSum: 0 } } });

    // Then loadAll is called, which does a GET
    const loadReq = httpMock.expectOne(`${API_BASE_URL}/orders`);
    loadReq.flush({ data: [...mockOrders, { _id: 'ord-3', ...newOrder, number: 'ORDER-20260521-003', totalSum: 0 }] });

    const result = await createPromise;
    expect(result._id).toBe('ord-3');
  });

  it('should handle loading state', async () => {
    expect(service.loading()).toBe(false);

    const loadPromise = service.loadAll();
    expect(service.loading()).toBe(true);

    const req = httpMock.expectOne(`${API_BASE_URL}/orders`);
    req.flush({ data: [] });
    await loadPromise;

    expect(service.loading()).toBe(false);
  });
});
