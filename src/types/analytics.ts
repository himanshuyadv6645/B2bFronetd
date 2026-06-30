import type { BaseEntity } from './index';

export interface AnalyticsEvent extends BaseEntity {
  event_type: string;
  entity_type: string;
  entity_id: string;
  user: string | null;
  ip_address: string;
  user_agent: string;
  metadata: Record<string, unknown> | null;
}

export interface EventStats {
  total_events: number;
  events_by_type: Record<string, number>;
  events_by_entity: Record<string, number>;
  top_products: Array<{
    product_id: string;
    product_name: string;
    view_count: number;
  }>;
  top_searches: Array<{
    query: string;
    count: number;
  }>;
}
