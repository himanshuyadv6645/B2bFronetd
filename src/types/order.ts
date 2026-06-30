import type { BaseEntity } from './index';

export interface OrderItem extends BaseEntity {
  order: string;
  seller: string;
  seller_name: string;
  variant: string;
  product_name: string;
  variant_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: string;
  tax_rate: string;
  tax_amount: string;
  shipping_charge: string;
  discount: string;
  total_price: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  variant_detail?: {
    id: string;
    name: string;
    image?: string | null;
    product?: { id: string; name: string; slug: string } | null;
  };
}

export interface Order extends BaseEntity {
  order_number: string;
  buyer_name: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'failed' | 'refunded' | 'partially_refunded';
  subtotal: string;
  total_tax: string;
  total_shipping: string;
  total_discount: string;
  total_amount: string;
  item_count: number;
  notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  delivered_at: string | null;
  items?: OrderItem[];
  seller_orders?: SellerOrder[];
}

export interface SellerOrder extends BaseEntity {
  order: string;
  order_number?: string;
  order_detail?: { order_number: string; buyer_name?: string };
  seller: string;
  seller_name?: string;
  buyer_name?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: string;
  total_tax: string;
  total_shipping: string;
  total_discount: string;
  total_amount: string;
  tracking_number: string | null;
  tracking_url: string | null;
  notes: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface Invoice extends BaseEntity {
  order: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: string;
  total_tax: string;
  total_discount: string;
  total_shipping: string;
  total_amount: string;
  status: 'draft' | 'generated' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string | null;
}

export interface Address {
  id: string;
  address_type: string;
  label: string;
  contact_name: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}
