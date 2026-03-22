export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedCollection<T> {
  data: T[];
  count: number;
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}
