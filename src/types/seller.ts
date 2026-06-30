import type { BaseEntity } from './index';
import type { User } from './user';

export interface SellerProfile extends BaseEntity {
  user: string;
  user_detail?: User;
  company_name: string;
  business_type: string;
  gst_number: string | null;
  pan_number: string | null;
  trade_license_number: string | null;
  brand_name: string | null;
  brand_description: string | null;
  brand_logo: string | null;
  website: string | null;
  description: string | null;
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approval_date: string | null;
  rejection_reason: string | null;
  suspension_reason: string | null;
  is_verified: boolean;
  verification_notes: string | null;
  total_products: number;
  total_orders: number;
  total_revenue: string;
  average_rating: string;
  total_reviews: number;
  commission_rate: string;
}

export interface SellerWarehouse extends BaseEntity {
  seller: string;
  name: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_active: boolean;
  is_primary: boolean;
}

export interface SellerApprovalRequest {
  action: 'approve' | 'reject';
  reason?: string;
}
