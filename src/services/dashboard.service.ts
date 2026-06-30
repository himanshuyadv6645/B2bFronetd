import api from '@/config/api';
import type { ApiResponse } from '@/types';
import type { BuyerDashboard, SellerDashboard, AdminDashboard } from '@/types/dashboard';

export const dashboardService = {
  getBuyerDashboard: async () => {
    const response = await api.get<ApiResponse<BuyerDashboard>>('/dashboard/buyer/');
    return response.data.data;
  },

  getSellerDashboard: async () => {
    const response = await api.get<ApiResponse<SellerDashboard>>('/dashboard/seller/');
    return response.data.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get<ApiResponse<AdminDashboard>>('/dashboard/admin/');
    return response.data.data;
  },
};
