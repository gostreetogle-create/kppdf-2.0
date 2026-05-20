export interface ResourceState<T> {
  loading: boolean;
  error: string | null;
  data: T;
}

export function initialResourceState<T>(initialData: T): ResourceState<T> {
  return { loading: true, error: null, data: initialData };
}