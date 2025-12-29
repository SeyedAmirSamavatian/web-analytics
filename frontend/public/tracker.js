(function() {
  'use strict';
  
  // Get tracking key from script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-key]');
  const trackingKey = scriptTag?.getAttribute('data-key');
  
  if (!trackingKey) {
    console.error('Web Analytics: Tracking key not found');
    return;
  }
  
  // Get or create visitor ID
  const VISITOR_ID_KEY = 'wa_visitor_id';
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  
  if (!visitorId) {
    visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  
  // Get API endpoint
  // Priority: 1. data-api attribute, 2. window.location.origin (same origin)
  let API_BASE = scriptTag?.getAttribute('data-api');
  if (!API_BASE) {
    // Use same origin by default
    API_BASE = window.location.origin;
  }
  // Remove trailing slash if exists
  API_BASE = API_BASE.replace(/\/$/, '');
  const TRACK_ENDPOINT = `${API_BASE}/api/analytics/track`;
  
  // Track page view
  function trackPageView() {
    const data = {
      trackingKey: trackingKey,
      visitorId: visitorId,
      pageUrl: window.location.href,
      referrer: document.referrer || '',
      durationSec: 0,
      clientIp: '',
      userAgent: navigator.userAgent
    };
    
    // Send using fetch (with proper CORS handling)
    fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      keepalive: true,
      credentials: 'omit' // Don't send credentials to avoid CORS issues
    }).catch(err => console.error('Web Analytics: Tracking error', err));
  }
  
  // Track time on page
  let startTime = Date.now();
  let durationTracked = false;
  
  function trackDuration() {
    if (durationTracked) return;
    durationTracked = true;
    
    const durationSec = Math.floor((Date.now() - startTime) / 1000);
    
    const data = {
      trackingKey: trackingKey,
      visitorId: visitorId,
      pageUrl: window.location.href,
      referrer: document.referrer || '',
      durationSec: durationSec,
      clientIp: '',
      userAgent: navigator.userAgent
    };
    
    fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      keepalive: true
    }).catch(err => console.error('Web Analytics: Duration tracking error', err));
  }
  
  // Track on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }
  
  // Track duration on page unload
  window.addEventListener('beforeunload', trackDuration);
  window.addEventListener('pagehide', trackDuration);
  
  // Track page visibility changes (for SPA)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      trackDuration();
    } else {
      startTime = Date.now();
      durationTracked = false;
    }
  });
  
  // Track hash changes (for SPA)
  let lastUrl = window.location.href;
  setInterval(function() {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      trackPageView();
      startTime = Date.now();
      durationTracked = false;
    }
  }, 1000);
})();

