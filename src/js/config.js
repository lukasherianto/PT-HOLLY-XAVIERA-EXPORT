/**
 * =====================================================
 * Configuration & Constants
 * =====================================================
 */

// Supabase Configuration (replace with your actual credentials)
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';

// Edge Function URL
export const EDGE_FUNCTION_URL = 'https://your-project.supabase.co/functions/v1/submit-order';

// LocalStorage Keys
export const STORAGE_KEYS = {
    CART: 'hollyxaviera_cart',
    CART_VERSION: 'hollyxaviera_cart_version',
    CACHE_PREFIX: 'hollyxaviera_cache_'
};

// Cache TTL (Time To Live) in milliseconds
export const CACHE_TTL = {
    PRODUCTS: 5 * 60 * 1000,      // 5 minutes
    ARTICLES: 5 * 60 * 1000,      // 5 minutes
    BANNERS: 10 * 60 * 1000,      // 10 minutes
    SETTINGS: 10 * 60 * 1000,     // 10 minutes
    PAGE_CONTENT: 10 * 60 * 1000  // 10 minutes
};

// App Version for cache busting
export const APP_VERSION = '1.0.0';

// Validation Patterns
export const PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
    REQUIRED_MIN_LENGTH: 2
};

// Default placeholder images
export const DEFAULT_IMAGES = {
    PRODUCT: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext fill="%236c757d" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E',
    ARTICLE: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext fill="%236c757d" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E',
    HERO: ''
};

// Debounce delay
export const DEBOUNCE_DELAY = 300;

// Toast duration
export const TOAST_DURATION = 4000;
