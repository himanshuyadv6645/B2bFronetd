import api from '@/config/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import type { Order, OrderItem, SellerOrder, Invoice } from '@/types/order';

export const orderService = {
  getOrders: async (params?: PaginationParams) => {
    const response = await api.get<PaginatedResponse<Order>>('/orders/', { params });
    return response.data;
  },

  getOrder: async (idOrNumber: string) => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${idOrNumber}/`);
    return response.data.data;
  },

  createOrder: async (data: {
    shipping_address: string;
    billing_address: string;
    payment_method: string;
    notes?: string;
  }) => {
    const response = await api.post<ApiResponse<Order>>('/orders/', {
      shipping_address_id: data.shipping_address,
      billing_address_id: data.billing_address,
      payment_method: data.payment_method,
      notes: data.notes,
    });
    return response.data.data;
  },

  cancelOrder: async (orderNumber: string, reason: string) => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${orderNumber}/cancel/`, { reason });
    return response.data.data;
  },

  getOrderItems: async (orderId: string) => {
    const response = await api.get<ApiResponse<OrderItem[]>>(`/orders/${orderId}/items/`);
    return response.data.data;
  },

  getSellerOrders: async (params?: PaginationParams) => {
    const response = await api.get<PaginatedResponse<SellerOrder>>('/orders/seller/', { params });
    return response.data;
  },

  getSellerOrder: async (id: string) => {
    const response = await api.get<ApiResponse<SellerOrder>>(`/orders/seller/${id}/`);
    return response.data.data;
  },

  shipSellerOrder: async (id: string, data: { tracking_number?: string; notes?: string }) => {
    const response = await api.post<ApiResponse<SellerOrder>>(`/orders/seller/${id}/ship/`, data);
    return response.data.data;
  },

  deliverSellerOrder: async (id: string) => {
    const response = await api.post<ApiResponse<SellerOrder>>(`/orders/seller/${id}/deliver/`);
    return response.data.data;
  },

  getInvoices: async (params?: PaginationParams) => {
    const response = await api.get<PaginatedResponse<Invoice>>('/orders/invoices/', { params });
    return response.data;
  },

  getInvoice: async (id: string) => {
    const response = await api.get<ApiResponse<Invoice>>(`/orders/invoices/${id}/`);
    return response.data.data;
  },
};
