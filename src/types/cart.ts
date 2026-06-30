import type { BaseEntity } from './index';

export interface CartItem extends BaseEntity {
  seller: string;
  seller_name: string;
  variant: string;
  variant_name: string;
  variant_image?: string | null;
  variant_detail?: {
    id: string;
    name: string;
    sku: string;
    image?: string | null;
    product?: { id: string; name: string; slug: string } | null;
  };
  quantity: number;
  unit_price: string;
  tax_rate: string;
  shipping_charge: string;
  total_price: string;
  notes: string | null;
}

export interface Cart {
  id: string;
  items?: CartItem[];
  total_items?: number;
  total_amount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WishlistItem extends BaseEntity {
  user: string;
  variant: string;
  variant_detail?: {
    id: string;
    name: string;
    sku: string;
    selling_price?: string | null;
    image?: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
    } | null;
    images?: Array<{
      image: string;
      image_url?: string;
      is_primary: boolean;
    }>;
  };
  notes: string | null;
}
