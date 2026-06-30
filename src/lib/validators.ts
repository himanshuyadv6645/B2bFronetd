import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Confirm password is required'),
  role: z.enum(['buyer', 'seller'], { error:'Role is required' }),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const addressSchema = z.object({
  address_type: z.enum(['billing', 'shipping'], { error:'Address type is required' }),
  label: z.string().min(1, 'Label is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_phone: z.string().min(10, 'Phone must be 10 digits').max(10),
  address_line1: z.string().min(1, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits').max(6),
  country: z.string().default('India'),
  is_default: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: z.string().min(10, 'Short description is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  hsn_code: z.string().optional(),
  taxable: z.boolean().default(true),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export const pricingSchema = z.object({
  variant: z.string().min(1, 'Variant is required'),
  warehouse: z.string().min(1, 'Warehouse is required'),
  selling_price: z.number().min(0, 'Price must be positive'),
  offer_price: z.number().optional(),
  tax_rate: z.number().min(0).max(100, 'Tax rate must be 0-100'),
  tax_inclusive: z.boolean().default(false),
  shipping_charge: z.number().min(0).default(0),
  free_shipping: z.boolean().default(false),
  minimum_order_quantity: z.number().min(1, 'MOQ must be at least 1'),
  max_order_quantity: z.number().optional(),
  warranty_type: z.string().optional(),
  warranty_period: z.string().optional(),
  delivery_time_days: z.number().min(1, 'Delivery time required'),
  estimated_delivery: z.string().optional(),
});

export const wholesaleTierSchema = z.object({
  min_quantity: z.number().min(1, 'Min quantity must be at least 1'),
  max_quantity: z.number().nullable().optional(),
  price_per_unit: z.number().min(0, 'Price must be positive'),
  discount_percent: z.number().min(0).max(100).default(0),
  notes: z.string().max(200).optional(),
});

export const sellerApprovalSchema = z.object({
  action: z.enum(['approve', 'reject'], { error:'Action is required' }),
  reason: z.string().optional(),
});

export const warehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required'),
  contact_phone: z.string().min(10, 'Phone must be 10 digits').max(10),
  address_line1: z.string().min(1, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits').max(6),
  country: z.string().default('India'),
  is_active: z.boolean().default(true),
  is_primary: z.boolean().default(false),
});

export const reviewSchema = z.object({
  order_item_id: z.string().min(1, 'Order item is required'),
  variant_id: z.string().optional(),
  rating: z.number().min(1, 'Rating is required').max(5),
  title: z.string().max(255).optional(),
  comment: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type PricingFormData = z.infer<typeof pricingSchema>;
export type WholesaleTierFormData = z.infer<typeof wholesaleTierSchema>;
export type SellerApprovalFormData = z.infer<typeof sellerApprovalSchema>;
export type WarehouseFormData = z.infer<typeof warehouseSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
