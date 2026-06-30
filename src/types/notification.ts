import type { BaseEntity } from './index';

export interface Notification extends BaseEntity {
  user: string;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'payment' | 'shipping' | 'system';
  is_read: boolean;
  read_at: string | null;
  link: string | null;
  metadata: Record<string, unknown> | null;
}

export interface NotificationTemplate extends BaseEntity {
  name: string;
  template_type: string;
  subject: string;
  body_template: string;
  is_active: boolean;
}
