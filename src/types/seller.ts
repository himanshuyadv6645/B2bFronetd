import type { BaseEntity } from './index';
import type { User } from './user';

export interface SellerProfile extends BaseEntity {
  user: string;
  user_detail?: User;
  company_name: string;
  business_type: string;
  gstin: string | null;
  pan_number: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  logo: string | null;
  banner: string | null;
  website: string | null;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approval_date: string | null;
  rejection_reason: string | null;
  is_verified: boolean;
  rating: string;
  total_ratings: number;
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
