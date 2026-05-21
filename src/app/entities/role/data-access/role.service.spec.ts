import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RoleService } from './role.service';
import { API_BASE_URL } from '../../../core/api.config';

describe('RoleService', () => {
  let service: RoleService;
  let httpMock: HttpTestingController;

  const mockRoles = [
    { name: 'director', label: 'Директор', permissions: ['order.view', 'order.edit'], isSystem: true, sortOrder: 10 },
    { name: 'manager', label: 'Менеджер', permissions: ['order.view'], isSystem: true, sortOrder: 20 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), RoleService],
    });
    service = TestBed.inject(RoleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load roles', async () => {
    const loadPromise = service.loadAll();
    const req = httpMock.expectOne(`${API_BASE_URL}/roles`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockRoles });
    await loadPromise;

    expect(service.list().length).toBe(2);
    expect(service.list()[0].name).toBe('director');
  });

  it('should get role by name', async () => {
    const getPromise = service.getByName('manager');
    const req = httpMock.expectOne(`${API_BASE_URL}/roles/manager`);
    req.flush({ data: mockRoles[1] });
    const role = await getPromise;
    expect(role?.label).toBe('Менеджер');
  });

  it('should create role', async () => {
    const data = { name: 'viewer', label: 'Наблюдатель', permissions: [] };
    const createPromise = service.create(data);

    const createReq = httpMock.expectOne(`${API_BASE_URL}/roles`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush({ data: { ...data, isSystem: false, sortOrder: 30 } });

    const loadReq = httpMock.expectOne(`${API_BASE_URL}/roles`);
    loadReq.flush({ data: [...mockRoles, { ...data, isSystem: false, sortOrder: 30 }] });

    const result = await createPromise;
    expect(result.name).toBe('viewer');
  });

  it('should delete role', async () => {
    const deletePromise = service.delete('viewer');

    const deleteReq = httpMock.expectOne(`${API_BASE_URL}/roles/viewer`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    const loadReq = httpMock.expectOne(`${API_BASE_URL}/roles`);
    loadReq.flush({ data: mockRoles });

    await deletePromise;
    expect(service.list().length).toBe(2);
  });

  it('should handle error on getByName for missing role', async () => {
    const getPromise = service.getByName('nonexistent');
    const req = httpMock.expectOne(`${API_BASE_URL}/roles/nonexistent`);
    req.flush({ data: null });
    const result = await getPromise;
    expect(result).toBeNull();
  });
});
