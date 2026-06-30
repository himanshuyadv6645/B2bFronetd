import type { BaseEntity } from './index';

export interface User extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'buyer' | 'seller' | 'admin';
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  last_login: string | null;
  full_name: string;
  avatar: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  role: 'buyer' | 'seller';
  phone?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
