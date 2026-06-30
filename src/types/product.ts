import type { BaseEntity, SoftDeleteEntity } from './index';

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  thumbnail: string | null;
  icon: string | null;
  parent: string | null;
  parent_detail?: Category;
  level: number;
  path: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  children?: Category[];
  product_count?: number;
  children_count?: number;
  ancestors?: Category[];
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface Brand extends BaseEntity {
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  is_active: boolean;
  is_featured: boolean;
  image?: string | null;
  country?: string | null;
  founded_year?: number | null;
  product_count?: number;
}

export interface Product extends SoftDeleteEntity {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  category_name?: string;
  category_detail?: Category;
  brand: string | null;
  brand_name?: string;
  brand_detail?: Brand;
  seller?: string;
  sku: string;
  hsn_code: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_trending?: boolean;
  is_top_seller?: boolean;
  is_verified?: boolean;
  views_count?: number;
  retail_price?: string;
  wholesale_price?: string;
  min_selling_price: string;
  max_selling_price: string;
  min_mrp?: string;
  max_mrp?: string;
  gst?: string;
  moq?: number;
  warranty?: string;
  country_of_origin?: string;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  specifications?: Record<string, string>;
  discount_percent?: number;
  primary_image?: string | null;
  total_sellers: number;
  total_stock: number;
  average_rating?: string;
  total_reviews?: number;
  attributes?: ProductAttribute[];
  images?: ProductImage[];
  documents?: ProductDocument[];
  variants?: ProductVariant[];
}

export interface ProductAttribute extends BaseEntity {
  product: string;
  name?: string;
  key?: string;
  value: string;
  unit: string | null;
  sort_order: number;
}

export interface ProductImage extends BaseEntity {
  product: string;
  image?: string;
  image_url?: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductDocument extends BaseEntity {
  product: string;
  title: string;
  file: string;
  document_type: string;
}

export interface ProductVariant extends SoftDeleteEntity {
  product: string;
  product_detail?: Product;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  selling_price: string;
  offer_price: string | null;
  tax_rate: string;
  tax_inclusive: boolean;
  stock_quantity: number;
  reserved_stock: number;
  available_stock: number;
  images?: VariantImage[];
  attributes?: VariantAttribute[];
}

export interface VariantAttribute extends BaseEntity {
  variant: string;
  name: string;
  value: string;
}

export interface VariantImage extends BaseEntity {
  variant: string;
  image: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductReview extends BaseEntity {
  product: string;
  variant: string | null;
  variant_detail?: ProductVariant;
  buyer: string;
  order_item: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
}

export interface SellerReview extends BaseEntity {
  seller: string;
  buyer: string;
  order: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
}
