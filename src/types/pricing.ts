import type { BaseEntity } from './index';

export interface SellerPricing extends BaseEntity {
  variant: string;
  variant_name?: string;
  seller_name?: string;
  seller_rating?: string | null;
  effective_price?: string;
  variant_detail?: {
    id: string;
    name: string;
    sku: string;
    slug?: string | null;
    selling_price?: string | null;
    image?: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  seller: string;
  seller_detail?: {
    id: string;
    company_name: string;
  };
  warehouse: string;
  warehouse_detail?: {
    id: string;
    name: string;
    city: string;
  };
  selling_price: string;
  offer_price: string | null;
  tax_rate: string;
  tax_inclusive: boolean;
  shipping_charge: string;
  free_shipping: boolean;
  minimum_order_quantity: number;
  max_order_quantity: number | null;
  warranty_type: string | null;
  warranty_period: string | null;
  delivery_time_days: number;
  estimated_delivery: string | null;
  is_active: boolean;
  wholesale_tiers?: WholesaleTier[];
}

export interface WholesaleTier extends BaseEntity {
  pricing: string;
  min_quantity: number;
  max_quantity: number | null;
  price_per_unit: string;
  discount_percent: string;
  notes: string | null;
}
