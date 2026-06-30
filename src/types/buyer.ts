import type { BaseEntity } from './index';
import type { User } from './user';

export interface BuyerProfile extends BaseEntity {
  user: string;
  user_detail?: User;
  company_name: string;
  business_type: string;
  gst_number: string | null;
  pan_number: string | null;
  trade_license_number: string | null;
  annual_turnover: string | null;
  employee_count: string | null;
  website: string | null;
  description: string | null;
  is_verified: boolean;
  verification_notes: string | null;
  total_orders: number;
  total_spent: string;
  average_order_value: string;
}

export interface BuyerAddress extends BaseEntity {
  user: string;
  address_type: 'billing' | 'shipping';
  label: string;
  contact_name: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}
