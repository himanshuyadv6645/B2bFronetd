import api from '@/config/api';
import type { PaginatedResponse } from '@/types';
import type { SellerProfile, SellerWarehouse } from '@/types/seller';

export const sellerService = {
  getProfile: async () => {
    const response = await api.get<{ success: boolean; data: SellerProfile }>('/sellers/profile/');
    return response.data.data;
  },

  updateProfile: async (data: Partial<SellerProfile>) => {
    const response = await api.patch<{ success: boolean; data: SellerProfile }>('/sellers/profile/', data);
    return response.data.data;
  },

  getWarehouses: async () => {
    const response = await api.get<PaginatedResponse<SellerWarehouse>>('/sellers/warehouses/');
    return response.data.results || [];
  },

  createWarehouse: async (data: Omit<SellerWarehouse, 'id' | 'created_at' | 'updated_at' | 'seller'>) => {
    const response = await api.post<{ success: boolean; data: SellerWarehouse }>('/sellers/warehouses/', data);
    return response.data.data;
  },

  updateWarehouse: async (id: string, data: Partial<SellerWarehouse>) => {
    const response = await api.patch<{ success: boolean; data: SellerWarehouse }>(`/sellers/warehouses/${id}/`, data);
    return response.data.data;
  },

  deleteWarehouse: async (id: string) => {
    await api.delete(`/sellers/warehouses/${id}/`);
  },
};
