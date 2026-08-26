export type AnalyticsEventName =
  | 'page_view'
  | 'search_performed'
  | 'product_impression'
  | 'product_viewed'
  | 'product_variant_selected'
  | 'dog_filter_applied'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'cart_drawer_opened'
  | 'checkout_started'
  | 'checkout_step_completed'
  | 'purchase_completed'
  | 'campaign_clicked'
  | 'coupon_applied'
  | 'review_submitted'
  | 'wishlist_toggled';

export interface EventMetadata {
  productId?: string;
  productName?: string;
  brandName?: string;
  categorySlug?: string;
  variantSku?: string;
  priceNok?: number;
  orderId?: string;
  orderTotalNok?: number;
  campaignSlug?: string;
  discountCode?: string;
  searchQuery?: string;
  searchResultCount?: number;
  dogId?: string;
  dogBreed?: string;
  stepName?: string;
  [key: string]: any;
}

export function trackEvent(eventName: AnalyticsEventName, metadata: EventMetadata = {}) {
  if (typeof window === 'undefined') return;

  const eventPayload = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    eventName,
    timestamp: new Date().toISOString(),
    url: window.location.pathname + window.location.search,
    metadata,
  };

  try {
    const raw = window.localStorage.getItem('hg_analytics_events_v1');
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(eventPayload);
    // Keep last 300 events in local storage buffer
    const trimmed = list.slice(0, 300);
    window.localStorage.setItem('hg_analytics_events_v1', JSON.stringify(trimmed));
  } catch (e) {
    console.debug('Analytics track error', e);
  }
}

export function getTrackedEvents(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('hg_analytics_events_v1');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
