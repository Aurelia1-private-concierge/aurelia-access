import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize GA4 - call this once in your app
export const initGA4 = (measurementId: string) => {
  if (typeof window === 'undefined') return;
  
  // Add gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
  });
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
};

// Track custom events
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', eventName, params);
};

// Track conversions
export const trackConversion = (
  conversionId: string,
  value?: number,
  currency?: string
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'conversion', {
    send_to: conversionId,
    value: value,
    currency: currency || 'GBP',
  });
};

// Predefined events for Aurelia
export const AureliaEvents = {
  waitlistView: () => trackEvent('waitlist_view'),
  waitlistSignup: (method: 'email' | 'phone', source?: string) => 
    trackEvent('waitlist_signup', { method, source }),
  waitlistShare: (platform: string) => 
    trackEvent('waitlist_share', { platform }),
  signUp: (method: string) => trackEvent('sign_up', { method }),
  login: (method: string) => trackEvent('login', { method }),
  serviceRequest: (category: string) => 
    trackEvent('service_request', { category }),
  contactSubmit: () => trackEvent('contact_submit'),
  partnerApply: () => trackEvent('partner_apply'),
  trialApply: () => trackEvent('trial_apply'),
  orlaChat: () => trackEvent('orla_chat_start'),
  musicPlay: (genre: string) => trackEvent('music_play', { genre }),
  voiceCommand: (command: string) => trackEvent('voice_command', { command }),
  campaignView: (campaignId: string) => 
    trackEvent('campaign_view', { campaign_id: campaignId }),
  campaignSignup: (campaignId: string) => 
    trackEvent('campaign_signup', { campaign_id: campaignId }),
};

// Hook for automatic page view tracking
export const useGA4PageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
};

// Component to wrap app with GA4
interface GA4ProviderProps {
  measurementId: string;
  children: React.ReactNode;
}

export const GA4Provider: React.FC<GA4ProviderProps> = ({ 
  measurementId, 
  children 
}) => {
  useEffect(() => {
    if (measurementId) {
      initGA4(measurementId);
    }
  }, [measurementId]);

  return React.createElement(React.Fragment, null, children);
};

export default useGA4PageTracking;
