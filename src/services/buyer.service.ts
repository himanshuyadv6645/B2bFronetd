import api from '@/config/api';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { BuyerProfile, BuyerAddress } from '@/types/buyer';
import type { DetectedLocation } from '@/services/location.service';

export const buyerService = {
  getProfile: async () => {
    const response = await api.get<{ success: boolean; data: BuyerProfile }>('/buyers/profile/');
    return response.data.data;
  },

  updateProfile: async (data: Partial<BuyerProfile>) => {
    const response = await api.patch<{ success: boolean; data: BuyerProfile }>('/buyers/profile/', data);
    return response.data.data;
  },

  getAddresses: async () => {
    const response = await api.get<PaginatedResponse<BuyerAddress>>('/buyers/addresses/');
    return response.data.results || [];
  },

  createAddress: async (data: Omit<BuyerAddress, 'id' | 'created_at' | 'updated_at' | 'user'>) => {
    const response = await api.post<ApiResponse<BuyerAddress>>('/buyers/addresses/', data);
    return response.data.data;
  },

  updateAddress: async (id: string, data: Partial<BuyerAddress>) => {
    const response = await api.patch<ApiResponse<BuyerAddress>>(`/buyers/addresses/${id}/`, data);
    return response.data.data;
  },

  deleteAddress: async (id: string) => {
    await api.delete(`/buyers/addresses/${id}/`);
  },

  setDefaultAddress: async (id: string) => {
    const response = await api.patch<ApiResponse<BuyerAddress>>(`/buyers/addresses/${id}/`, { is_default: true });
    return response.data.data;
  },

  saveDetectedLocation: async (coords: DetectedLocation) => {
    console.log('[API] saveDetectedLocation calling with:', coords);
    try {
      const response = await api.post<ApiResponse<BuyerAddress>>('/buyers/locations/detect/', {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      console.log('[API] saveDetectedLocation response:', response.data);
      return response.data.data;
    } catch (err: any) {
      console.error('[API] saveDetectedLocation error:', err?.response?.data || err?.message);
      throw err;
    }
  },
};
