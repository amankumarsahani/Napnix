// Meta (Facebook) Pixel helpers.
// Base pixel + initial PageView are loaded in index.html.
// This module fires SPA route-change PageViews and conversion events, and
// supports browser<->server (Conversions API) deduplication via a shared
// eventID.

export const fbqTrack = (event, params, options) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (options) window.fbq('track', event, params || {}, options);
    else if (params) window.fbq('track', event, params);
    else window.fbq('track', event);
  }
};

// Fire on every client-side route change (SPA navigation).
export const trackPageView = () => fbqTrack('PageView');

// Generate a unique event id for browser<->server deduplication.
export const newEventId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

// Read a cookie value by name (used for _fbp / _fbc match quality).
export const getCookie = (name) => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : undefined;
};

// Collect Meta attribution data to forward to the server (Conversions API).
export const getMetaContext = () => ({
  eventId: newEventId(),
  fbp: getCookie('_fbp'),
  fbc: getCookie('_fbc'),
  sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
});

// Fire the browser-side Lead, sharing eventID with the server event so Meta
// deduplicates the two. Pass the eventId returned by getMetaContext().
export const trackLead = (params = {}, eventId) => {
  fbqTrack('Lead', params, eventId ? { eventID: eventId } : undefined);
};
