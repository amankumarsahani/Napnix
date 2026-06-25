// Meta (Facebook) Pixel helpers.
// Base pixel + initial PageView are loaded in index.html.
// This module fires SPA route-change PageViews and conversion events.

export const fbqTrack = (event, params) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (params) window.fbq('track', event, params);
    else window.fbq('track', event);
  }
};

// Fire on every client-side route change (SPA navigation).
export const trackPageView = () => fbqTrack('PageView');

// Fire when a contact / enquiry form is successfully submitted.
export const trackLead = (params) => fbqTrack('Lead', params);
