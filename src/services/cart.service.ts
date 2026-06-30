import api from '@/config/api';
import type { ApiResponse } from '@/types';
import type { Cart, CartItem } from '@/types/cart';

export const cartService = {
  getCart: async () => {
    const response = await api.get<ApiResponse<Cart>>('/cart/');
    return response.data.data;
  },

  addToCart: async (sellerId: string, variantId: string, quantity: number, notes?: string) => {
    const response = await api.post<ApiResponse<CartItem>>('/cart/add/', {
      seller_id: sellerId,
      variant_id: variantId,
      quantity,
      notes,
    });
    return response.data.data;
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    const response = await api.patch<ApiResponse<CartItem>>(`/cart/item/${itemId}/`, { quantity });
    return response.data.data;
  },

  removeCartItem: async (itemId: string) => {
    await api.delete(`/cart/item/${itemId}/remove/`);
  },

  clearCart: async () => {
    await api.delete('/cart/clear/');
  },
};
