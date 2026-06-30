import api from '@/config/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import type { Inventory, StockHistory } from '@/types/inventory';

export const inventoryService = {
  getInventory: async (params?: PaginationParams) => {
    const response = await api.get<PaginatedResponse<Inventory>>('/inventory/', { params });
    return response.data;
  },

  createInventory: async (data: { variant: string; warehouse: string; total_stock: number; low_stock_threshold?: number }) => {
    const response = await api.post<ApiResponse<Inventory>>('/inventory/create/', data);
    return response.data.data;
  },

  adjustStock: async (id: string, data: { quantity: number; change_type: 'add' | 'remove' | 'adjustment'; notes?: string }) => {
    const response = await api.post<ApiResponse<Inventory>>(`/inventory/${id}/adjust/`, data);
    return response.data.data;
  },

  getStockHistory: async (params?: PaginationParams) => {
    const response = await api.get<PaginatedResponse<StockHistory>>('/inventory/history/', { params });
    return response.data;
  },
};
