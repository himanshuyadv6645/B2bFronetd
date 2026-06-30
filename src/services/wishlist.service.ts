import api from '@/config/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import type { WishlistItem } from '@/types/cart';

export const wishlistService = {
  getWishlist: async (params?: PaginationParams) => {
    const response = await api.get<PaginatedResponse<WishlistItem>>('/wishlist/', { params });
    return response.data;
  },

  addToWishlist: async (variantId: string, notes?: string) => {
    const response = await api.post<ApiResponse<WishlistItem>>('/wishlist/', {
      variant_id: variantId,
      notes,
    });
    return response.data.data;
  },

  removeFromWishlist: async (itemId: string) => {
    await api.delete(`/wishlist/${itemId}/`);
  },
};
