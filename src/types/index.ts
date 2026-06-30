export interface PaginatedResponse<T> {
  pagination?: {
    count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    next: string | null;
    previous: string | null;
  };
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  // Some endpoints return data directly without wrapper
  id?: string;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  status_code?: number;
}

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface SoftDeleteEntity extends BaseEntity {
  deleted_at: string | null;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}
