/**
 * =====================================================
 * Utility Functions
 * Sanitization, Caching, Helpers
 * =====================================================
 */

import { STORAGE_KEYS, CACHE_TTL, APP_VERSION, PATTERNS } from './config.js';

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Sanitize object properties
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
export function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeHTML(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

/**
 * Cache utilities with versioning and TTL
 */
export const cache = {
    /**
     * Get cached data if not expired
     * @param {string} key - Cache key
     * @returns {*} Cached data or null
     */
    get(key) {
        try {
            const item = localStorage.getItem(STORAGE_KEYS.CACHE_PREFIX + key);
            if (!item) return null;
            
            const { data, timestamp, version } = JSON.parse(item);
            
            // Check version compatibility
            if (version !== APP_VERSION) {
                this.remove(key);
                return null;
            }
            
            // Check TTL
            if (timestamp && Date.now() - timestamp > CACHE_TTL[key.toUpperCase()] || Infinity) {
                this.remove(key);
                return null;
            }
            
            return data;
        } catch (e) {
            return null;
        }
    },
    
    /**
     * Set cache data
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     */
    set(key, data) {
        try {
            const item = {
                data,
                timestamp: Date.now(),
                version: APP_VERSION
            };
            localStorage.setItem(STORAGE_KEYS.CACHE_PREFIX + key, JSON.stringify(item));
        } catch (e) {
            // Storage full or unavailable
        }
    },
    
    /**
     * Remove cached data
     * @param {string} key - Cache key
     */
    remove(key) {
        localStorage.removeItem(STORAGE_KEYS.CACHE_PREFIX + key);
    },
    
    /**
     * Clear all app caches
     */
    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(STORAGE_KEYS.CACHE_PREFIX))
            .forEach(key => localStorage.removeItem(key));
    }
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Generate slug from string
 * @param {string} str - String to slugify
 * @returns {string} Slug
 */
export function generateSlug(str) {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export function isValidEmail(email) {
    return PATTERNS.EMAIL.test(email);
}

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid
 */
export function isValidPhone(phone) {
    return PATTERNS.PHONE.test(phone);
}

/**
 * Create lazy loading image observer
 * @returns {IntersectionObserver} Image observer
 */
export function createImageObserver() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '50px 0px' });
    
    return imageObserver;
}

/**
 * Initialize lazy loading for images
 * @param {string} containerSelector - Container selector
 */
export function initLazyLoading(containerSelector = 'body') {
    const observer = createImageObserver();
    const images = document.querySelectorAll(`${containerSelector} img[data-src]`);
    images.forEach(img => observer.observe(img));
}

/**
 * Show toast notification
 * @param {string} message - Message to show
 * @param {string} type - Type: success, error, info
 */
export function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type} active`;
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}

/**
 * Escape HTML entities
 * @param {string} html - HTML to escape
 * @returns {string} Escaped string
 */
export function escapeHTML(html) {
    const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return html.replace(/[&<>"']/g, char => escapeMap[char]);
}

/**
 * Parse JSON safely
 * @param {string} json - JSON string
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed data or default
 */
export function safeJSONParse(json, defaultValue = null) {
    try {
        return JSON.parse(json);
    } catch (e) {
        return defaultValue;
    }
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} Is in viewport
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Smooth scroll to element
 * @param {string} selector - Element selector
 */
export function smoothScrollTo(selector) {
    const element = document.querySelector(selector);
    if (element) {
        const headerOffset = 70;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}
