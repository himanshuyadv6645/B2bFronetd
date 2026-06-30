import api from '@/config/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import type { SellerPricing, WholesaleTier } from '@/types/pricing';

export const pricingService = {
  getPricing: async (params?: PaginationParams) => {
    const response = await api.get<PaginatedResponse<SellerPricing>>('/pricing/', { params });
    return response.data;
  },

  getPricingById: async (id: string) => {
    const response = await api.get<SellerPricing>(`/pricing/${id}/`);
    return response.data;
  },

  createPricing: async (data: Partial<SellerPricing>) => {
    const response = await api.post<ApiResponse<SellerPricing>>('/pricing/create/', data);
    return response.data.data;
  },

  updatePricing: async (id: string, data: Partial<SellerPricing>) => {
    const response = await api.patch<ApiResponse<SellerPricing>>(`/pricing/${id}/`, data);
    return response.data.data;
  },

  deletePricing: async (id: string) => {
    await api.delete(`/pricing/${id}/`);
  },

  getWholesaleTiers: async (pricingId: string) => {
    const response = await api.get<PaginatedResponse<WholesaleTier>>(`/pricing/${pricingId}/tiers/`);
    return response.data.results || [];
  },

  createWholesaleTier: async (pricingId: string, data: Omit<WholesaleTier, 'id' | 'created_at' | 'updated_at' | 'pricing'>) => {
    const response = await api.post<ApiResponse<WholesaleTier>>(`/pricing/${pricingId}/tiers/`, data);
    return response.data.data;
  },

  deleteWholesaleTier: async (pricingId: string, tierId: string) => {
    await api.delete(`/pricing/${pricingId}/tiers/${tierId}/`);
  },

  comparePricing: async (variantId: string) => {
    const response = await api.get<ApiResponse<SellerPricing[]>>(`/pricing/compare/${variantId}/`);
    return response.data.data;
  },
};
