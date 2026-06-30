import api from '@/config/api';
import type { ApiResponse } from '@/types';
import type { User, LoginRequest, RegisterRequest, ChangePasswordRequest, AuthTokens } from '@/types/user';

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login/', data);
    return response.data.data!;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register/', data);
    return response.data.data!;
  },

  logout: async (refreshToken: string) => {
    await api.post('/auth/logout/', { refresh: refreshToken });
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/profile/');
    return response.data.data!;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.patch<ApiResponse<User>>('/auth/profile/', data);
    return response.data.data;
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const response = await api.post<ApiResponse<{ message: string }>>('/users/change-password/', data);
    return response.data.data;
  },

  refreshToken: async (refresh: string) => {
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/token/refresh/', { refresh });
    return response.data.data;
  },
};
