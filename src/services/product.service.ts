import api from '@/config/api';
import type { PaginatedResponse, PaginationParams } from '@/types';
import type { Product, Category, Brand, ProductReview, SellerReview } from '@/types/product';

export interface VariantOption {
  id: string;
  product: string;
  product_name?: string;
  sku: string;
  name: string;
  slug: string;
  is_active?: boolean;
  min_selling_price?: string;
  max_selling_price?: string;
  total_stock?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeListResponse<T>(data: any): PaginatedResponse<T> {
  if (data && data.pagination) {
    return {
      count: data.pagination.count,
      next: data.pagination.next,
      previous: data.pagination.previous,
      results: data.results,
    };
  }
  return data as PaginatedResponse<T>;
}

export const productService = {
  getProducts: async (params?: PaginationParams) => {
    const response = await api.get('/products/', { params });
    return normalizeListResponse<Product>(response.data);
  },

  getProduct: async (idOrSlug: string) => {
    const response = await api.get(`/products/${idOrSlug}/`);
    // Backend returns product directly, not wrapped in { success, data }
    const data = response.data;
    return (data.data || data) as Product;
  },

  getVariants: async (params?: PaginationParams) => {
    const response = await api.get('/variants/', { params });
    return normalizeListResponse<VariantOption>(response.data);
  },

  createVariant: async (data: { product: string; name: string; sku: string; description?: string }) => {
    const response = await api.post('/variants/create/', data);
    const d = response.data;
    return d.data || d;
  },

  createProduct: async (data: Partial<Product>) => {
    const response = await api.post('/products/create/', data);
    const d = response.data;
    return d.data || d;
  },

  updateProduct: async (id: string, data: Partial<Product>) => {
    const response = await api.patch(`/products/${id}/update/`, data);
    const d = response.data;
    return d.data || d;
  },

  deleteProduct: async (id: string) => {
    await api.delete(`/products/${id}/update/`);
  },

  getCategories: async (params?: PaginationParams) => {
    const response = await api.get('/categories/', { params });
    return normalizeListResponse<Category>(response.data);
  },

  getCategoryTree: async () => {
    const response = await api.get('/categories/tree/');
    const d = response.data;
    return d.data || d;
  },

  getCategory: async (idOrSlug: string) => {
    const response = await api.get(`/categories/${idOrSlug}/`);
    const d = response.data;
    return d.data || d;
  },

  createCategory: async (data: Partial<Category>) => {
    const response = await api.post('/categories/admin/create/', data);
    const d = response.data;
    return d.data || d;
  },

  updateCategory: async (slug: string, data: Partial<Category>) => {
    const response = await api.patch(`/categories/${slug}/`, data);
    const d = response.data;
    return d.data || d;
  },

  deleteCategory: async (slug: string) => {
    await api.delete(`/categories/${slug}/`);
  },

  getBrands: async (params?: PaginationParams) => {
    const response = await api.get('/brands/', { params });
    return normalizeListResponse<Brand>(response.data);
  },

  getBrand: async (idOrSlug: string) => {
    const response = await api.get(`/brands/${idOrSlug}/`);
    const d = response.data;
    return d.data || d;
  },

  createBrand: async (data: Partial<Brand>) => {
    const response = await api.post('/brands/admin/create/', data);
    const d = response.data;
    return d.data || d;
  },

  updateBrand: async (slug: string, data: Partial<Brand>) => {
    const response = await api.patch(`/brands/${slug}/`, data);
    const d = response.data;
    return d.data || d;
  },

  deleteBrand: async (slug: string) => {
    await api.delete(`/brands/${slug}/`);
  },

  getProductReviews: async (productId: string, params?: PaginationParams) => {
    const response = await api.get('/reviews/products/', { params: { ...params, product: productId } });
    return normalizeListResponse<ProductReview>(response.data);
  },

  createProductReview: async (productId: string, data: Partial<ProductReview>) => {
    const response = await api.post('/reviews/products/', { ...data, product: productId });
    const d = response.data;
    return d.data || d;
  },

  getSellerReviews: async (sellerId: string, params?: PaginationParams) => {
    const response = await api.get('/reviews/sellers/', { params: { ...params, seller: sellerId } });
    return normalizeListResponse<SellerReview>(response.data);
  },

  createSellerReview: async (sellerId: string, data: Partial<SellerReview>) => {
    const response = await api.post('/reviews/sellers/', { ...data, seller: sellerId });
    const d = response.data;
    return d.data || d;
  },

  comparePricing: async (variantId: string) => {
    const response = await api.get(`/pricing/compare/${variantId}/`);
    const d = response.data;
    return d.data || d;
  },

  // --- Product Images ---
  getProductImages: async (productId: string) => {
    const response = await api.get(`/products/${productId}/images/`);
    const d = response.data;
    return d.data || d;
  },

  uploadProductImage: async (productId: string, file: File, opts?: { alt_text?: string; is_primary?: boolean; sort_order?: number }) => {
    const formData = new FormData();
    formData.append('image', file);
    if (opts?.alt_text) formData.append('alt_text', opts.alt_text);
    if (opts?.is_primary) formData.append('is_primary', 'true');
    if (opts?.sort_order !== undefined) formData.append('sort_order', String(opts.sort_order));
    const response = await api.post(`/products/${productId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const d = response.data;
    return d.data || d;
  },

  deleteProductImage: async (productId: string, imageId: string) => {
    await api.delete(`/products/${productId}/images/${imageId}/delete/`);
  },

  // --- Variant Images ---
  getVariantImages: async (variantId: string) => {
    const response = await api.get(`/variants/${variantId}/images/`);
    const d = response.data;
    return d.data || d;
  },

  uploadVariantImage: async (variantId: string, file: File, opts?: { alt_text?: string; is_primary?: boolean; sort_order?: number }) => {
    const formData = new FormData();
    formData.append('image', file);
    if (opts?.alt_text) formData.append('alt_text', opts.alt_text);
    if (opts?.is_primary) formData.append('is_primary', 'true');
    if (opts?.sort_order !== undefined) formData.append('sort_order', String(opts.sort_order));
    const response = await api.post(`/variants/${variantId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const d = response.data;
    return d.data || d;
  },

  deleteVariantImage: async (variantId: string, imageId: string) => {
    await api.delete(`/variants/${variantId}/images/${imageId}/delete/`);
  },
};
