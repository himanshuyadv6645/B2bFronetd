import { API_BASE_URL } from '@/lib/constants';
import { getTokens } from '@/config/api';

/**
 * Lightweight behavioural-event tracking.
 *
 * Fire-and-forget: we never await these calls and never surface errors to the
 * user — analytics must never block or break a real user flow.
 *
 * We use `fetch` with `keepalive: true` (instead of the axios `api` instance)
 * for two reasons:
 *   1. keepalive lets the request survive a page unload / route change, so
 *      events fired right before a redirect (e.g. payment_initiated) still land.
 *   2. we attach the Bearer token manually so the backend can associate the
 *      event with the logged-in user. (navigator.sendBeacon can't set headers,
 *      so it would post everything as anonymous — hence fetch, not sendBeacon.)
 *
 * The backend endpoint is AllowAny, so events from guests are accepted too and
 * get attributed by IP / session on the server side.
 */

export type AnalyticsEntityType =
  | 'product'
  | 'category'
  | 'cart'
  | 'checkout'
  | 'payment'
  | 'order'
  | 'search'
  | 'wishlist';

export type AnalyticsEventType =
  | 'product_view'
  | 'category_view'
  | 'search'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'buy_now'
  | 'checkout_started'
  | 'payment_initiated'
  | 'wishlist_add';

interface TrackPayload {
  event_type: AnalyticsEventType | string;
  entity_type?: AnalyticsEntityType;
  entity_id?: string;
  metadata?: Record<string, unknown>;
}

function track(
  eventType: TrackPayload['event_type'],
  entityType?: AnalyticsEntityType,
  entityId?: string,
  metadata: Record<string, unknown> = {}
): void {
  try {
    const tokens = getTokens();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (tokens?.access) {
      headers.Authorization = `Bearer ${tokens.access}`;
    }

    const body = JSON.stringify({
      event_type: eventType,
      entity_type: entityType,
      // entity_id must be a UUID on the backend; omit it if not provided.
      entity_id: entityId || undefined,
      metadata,
    });

    void fetch(`${API_BASE_URL}/analytics/track/`, {
      method: 'POST',
      keepalive: true,
      headers,
      body,
    }).catch(() => {
      /* analytics is best-effort; swallow all errors */
    });
  } catch {
    /* never let tracking throw into a user flow */
  }
}

export const analyticsService = {
  track,

  productView: (productId: string, metadata: Record<string, unknown> = {}) =>
    track('product_view', 'product', productId, metadata),

  addToCart: (productId: string, metadata: Record<string, unknown> = {}) =>
    track('add_to_cart', 'product', productId, metadata),

  buyNow: (productId: string, metadata: Record<string, unknown> = {}) =>
    track('buy_now', 'product', productId, metadata),

  checkoutStarted: (metadata: Record<string, unknown> = {}) =>
    track('checkout_started', 'checkout', undefined, metadata),

  paymentInitiated: (metadata: Record<string, unknown> = {}) =>
    track('payment_initiated', 'payment', undefined, metadata),
};

export default analyticsService;
