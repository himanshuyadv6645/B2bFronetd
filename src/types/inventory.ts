import type { BaseEntity } from './index';

export interface Inventory extends BaseEntity {
  variant: string;
  variant_detail?: {
    id: string;
    name: string;
    sku: string;
    image?: string | null;
    product: {
      id: string;
      name: string;
      slug?: string;
    } | null;
  };
  seller: string;
  warehouse: string;
  warehouse_detail?: {
    id: string;
    name: string;
    city: string;
  };
  total_stock: number;
  reserved_stock: number;
  available_stock: number;
  low_stock_threshold: number;
  reorder_point: number;
  reorder_quantity: number;
  last_restocked_at: string | null;
  is_active: boolean;
}

export interface StockHistory extends BaseEntity {
  inventory: string;
  inventory_detail?: {
    id: string;
    variant: string;
    warehouse: string;
  };
  change_type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage' | 'expiry';
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  reference_id: string | null;
  notes: string | null;
  performed_by: string;
}

export interface InventoryLog extends BaseEntity {
  inventory: string;
  action: string;
  quantity: number;
  performed_by: string;
  notes: string | null;
}
