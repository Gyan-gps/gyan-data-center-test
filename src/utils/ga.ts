import TagManager from "react-gtm-module";

// Define types for GTM data layer
type DataLayerEvent = Record<string, string | number | boolean | undefined>;

// Extend Window interface to include dataLayer
declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
  }
}

// GTM Container ID
const GTM_ID = import.meta.env.VITE_GTM_ID || 'GTM-TMV982KD'; 

// Initialize GTM
export const initializeGTM = () => {
  if (typeof window !== 'undefined') {
    TagManager.initialize({
      gtmId: GTM_ID,
    });
  }
};

// Helper to push to GTM dataLayer using react-gtm-module with a fallback to window.dataLayer
export const pushDataLayer = (payload: DataLayerEvent = {}) => {
  try {
    // Primary: use react-gtm-module
    TagManager.dataLayer({
      dataLayer: payload,
    });
  } catch (err) {
    console.error('Failed to push via react-gtm-module', err);
    
    // Fallback: try to push to window.dataLayer if available
    if (typeof window !== 'undefined') {
      try {
        // Initialize dataLayer if it doesn't exist
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(payload);
      } catch (e) {
        console.error('Failed to push to window.dataLayer', e);
      }
    } else {
      console.error('No window object available (not in browser environment)');
    }
  }
};

// Common GA4 events
export const trackEvent = (eventName: string, parameters: DataLayerEvent = {}) => {
  pushDataLayer({
    event: eventName,
    ...parameters,
  });
};

// Page view tracking
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  pushDataLayer({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });
};

// User login tracking
export const trackLogin = (method: string = 'email') => {
  pushDataLayer({
    event: 'login',
    method,
  });
};

// User logout tracking
export const trackLogout = () => {
  pushDataLayer({
    event: 'logout',
  });
};

// Custom events for your app
export const trackReportDownload = (reportId: string, reportTitle: string) => {
  pushDataLayer({
    event: 'report_download',
    report_id: reportId,
    report_title: reportTitle,
  });
};

export const trackReportAccess = (reportId: string, reportTitle: string) => {
  pushDataLayer({
    event: 'report_access_request',
    report_id: reportId,
    report_title: reportTitle,
  });
};

export const trackSearch = (searchTerm: string, searchType: string = 'general') => {
  pushDataLayer({
    event: 'search',
    search_term: searchTerm,
    search_type: searchType,
  });
};

export const trackFilterApply = (filterType: string, filterValue: string) => {
  pushDataLayer({
    event: 'filter_apply',
    filter_type: filterType,
    filter_value: filterValue,
  });
};

// Helper function to extract company domain from email
const getCompanyDomain = (email: string): string => {
  const atIndex = email.indexOf('@');
  return atIndex !== -1 ? email.substring(atIndex + 1) : '';
};

// Enhanced page view tracking with user context
export const trackPageViewWithUser = (
  pagePath: string, 
  pageTitle: string | undefined, 
  userId: string, 
  userEmail: string
) => {
  pushDataLayer({
    event: 'page_view',
    page_location: window.location.href,
    page_title: pageTitle || document.title,
    company_domain: getCompanyDomain(userEmail),
    user_id: userId,
  });
};

// User login tracking with enhanced parameters
export const trackUserLogin = (userId: string, userEmail: string) => {
  pushDataLayer({
    event: 'user_login',
    user_id: userId,
    company_domain: getCompanyDomain(userEmail),
  });
};

// User logout tracking with enhanced parameters
export const trackUserLogout = (userId: string, userEmail: string) => {
  pushDataLayer({
    event: 'user_logout',
    user_id: userId,
    company_domain: getCompanyDomain(userEmail),
  });
};

// AI usage tracking (conversion event)
export const trackAiUsage = (
  userId: string = '',
  userEmail: string = '',
  totalCredits: number = 0,
  creditsUsed: number = 0,
  remainingCredits: number = 0
) => {
  pushDataLayer({
    event: 'ai_usage',
    user_id: userId,
    total_credits: totalCredits,
    credits_used: creditsUsed,
    remaining_credits: remainingCredits,
    company_domain: getCompanyDomain(userEmail),
  });
};

// File download tracking (conversion event)
export const trackFileDownload = (
  userId: string = '',
  userEmail: string = '',
  fileName: string,
  fileType: string
) => {
  pushDataLayer({
    event: 'file_download',
    user_id: userId,
    file_name: fileName,
    file_type: fileType,
    company_domain: getCompanyDomain(userEmail),
  });
};

// Site search tracking
export const trackSiteSearch = (
  searchTerm: string,
  userId: string,
  userEmail: string
) => {
  pushDataLayer({
    event: 'site_search',
    search_term: searchTerm,
    company_domain: getCompanyDomain(userEmail),
    user_id: userId,
  });
};

// Menu navigation tracking
export const trackMenuNavigation = (
  menuItem: string,
  pageUrl: string,
  userEmail: string
) => {
  pushDataLayer({
    event: 'menu_navigation',
    menu_item: menuItem,
    page_url: pageUrl,
    company_domain: getCompanyDomain(userEmail),
  });
};

// submit demo request tracking
export const trackDCIDemoRequest = (
  userEmail: string = '',
  userName: string = '',
  companyName: string = '',
  message: string = '',
  phoneNumber: string = '', 
  countryCode: string = ''
) => {
  pushDataLayer({
    event: 'dci_demo_request',
    user_name: userName,
    company_name: companyName,
    message: message,
    phone_number: phoneNumber,
    country_code: countryCode,
    company_domain: getCompanyDomain(userEmail),
  });
};