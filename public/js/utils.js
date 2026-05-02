/**
 * PT. Holly Xaviera Export - Utility Functions
 * Performance-optimized helpers for the application
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    SUPABASE_URL: (typeof window !== 'undefined' && window.env && window.env.SUPABASE_URL) || 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: (typeof window !== 'undefined' && window.env && window.env.SUPABASE_ANON_KEY) || 'YOUR_SUPABASE_ANON_KEY',
    EDGE_FUNCTION_URL: (typeof window !== 'undefined' && window.env && window.env.EDGE_FUNCTION_URL) || 'https://YOUR_PROJECT.supabase.co/functions/v1/submit-order',
    CACHE_VERSION: 'v1.0.0',
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes
    DEBOUNCE_DELAY: 300
};

// Initialize Supabase client safely
const supabase = (typeof window !== 'undefined' && window.supabase) 
    ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
    : null;

// ============================================
// SANITIZATION (XSS Prevention)
// ============================================
const sanitizeHTML = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

const sanitizeInput = (str) => {
    if (!str) return '';
    return str.replace(/[<>\"'&]/g, (char) => {
        const entities = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '&': '&amp;'
        };
        return entities[char] || char;
    });
};

// ============================================
// LOCAL STORAGE WITH VERSIONING & TTL
// ============================================
const Storage = {
    key: (name) => `${CONFIG.CACHE_VERSION}_${name}`,
    
    get: (name) => {
        try {
            const item = localStorage.getItem(Storage.key(name));
            if (!item) return null;
            
            const { value, expiry } = JSON.parse(item);
            if (expiry && Date.now() > expiry) {
                localStorage.removeItem(Storage.key(name));
                return null;
            }
            return value;
        } catch (e) {
            return null;
        }
    },
    
    set: (name, value, ttl = CONFIG.CACHE_TTL) => {
        try {
            const item = {
                value,
                expiry: ttl ? Date.now() + ttl : null
            };
            localStorage.setItem(Storage.key(name), JSON.stringify(item));
            return true;
        } catch (e) {
            return false;
        }
    },
    
    remove: (name) => {
        localStorage.removeItem(Storage.key(name));
    },
    
    clear: () => {
        Object.keys(localStorage)
            .filter(key => key.startsWith(CONFIG.CACHE_VERSION.split('.')[0]))
            .forEach(key => localStorage.removeItem(key));
    }
};

// ============================================
// DEBOUNCE & THROTTLE
// ============================================
const debounce = (func, wait = CONFIG.DEBOUNCE_DELAY) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit = 100) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ============================================
// LAZY LOADING IMAGES
// ============================================
const initLazyLoad = () => {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================
const Toast = {
    show: (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        
        container.appendChild(toast);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },
    
    success: (message) => Toast.show(message, 'success'),
    error: (message) => Toast.show(message, 'error')
};

// ============================================
// MODAL MANAGEMENT
// ============================================
const Modal = {
    open: (modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus trap
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length) {
            focusableElements[0].focus();
        }
        
        // Close on overlay click
        const overlay = modal.querySelector('.modal-overlay, .cart-overlay');
        if (overlay) {
            overlay.onclick = () => Modal.close(modalId);
        }
    },
    
    close: (modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Return focus to trigger element
        const trigger = document.querySelector(`[aria-controls="${modalId}"]`);
        if (trigger) {
            trigger.focus();
        }
    }
};

// ============================================
// FORM VALIDATION
// ============================================
const Validator = {
    required: (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return 'This field is required';
        }
        return null;
    },
    
    email: (value) => {
        if (!value) return null;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(value)) {
            return 'Please enter a valid email address';
        }
        return null;
    },
    
    minLength: (value, min) => {
        if (!value) return null;
        if (value.length < min) {
            return `Minimum ${min} characters required`;
        }
        return null;
    },
    
    phone: (value) => {
        if (!value) return null;
        const regex = /^[\d\s\+\-\(\)]{8,20}$/;
        if (!regex.test(value)) {
            return 'Please enter a valid phone number';
        }
        return null;
    }
};

const validateField = (input, rules = []) => {
    const value = input.value.trim();
    let error = null;
    
    for (const rule of rules) {
        if (typeof rule === 'string') {
            if (rule === 'required') error = Validator.required(value);
            else if (rule === 'email') error = Validator.email(value);
            else if (rule === 'phone') error = Validator.phone(value);
        } else if (typeof rule === 'object') {
            if (rule.name === 'minLength') error = Validator.minLength(value, rule.value);
        }
        if (error) break;
    }
    
    const errorElement = input.parentElement.querySelector('.error-message');
    if (error) {
        input.classList.add('error');
        if (errorElement) errorElement.textContent = error;
    } else {
        input.classList.remove('error');
        if (errorElement) errorElement.textContent = '';
    }
    
    return !error;
};

// ============================================
// API HELPERS
// ============================================
const API = {
    async fetch(endpoint, options = {}) {
        try {
            const response = await fetch(`${CONFIG.SUPABASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'apikey': CONFIG.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API fetch error:', error);
            throw error;
        }
    },
    
    async submitOrder(orderData) {
        try {
            const response = await fetch(CONFIG.EDGE_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': CONFIG.SUPABASE_ANON_KEY
                },
                body: JSON.stringify(orderData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit order');
            }
            
            return result;
        } catch (error) {
            console.error('Order submission error:', error);
            throw error;
        }
    }
};

// ============================================
// DATE FORMATTING
// ============================================
const formatDate = (dateString, options = {}) => {
    const date = new Date(dateString);
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDate(dateString, { month: 'short', day: 'numeric' });
};

// ============================================
// SLUG GENERATION
// ============================================
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// ============================================
// CURRENCY FORMATTING
// ============================================
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);
};

// ============================================
// EXPORT FOR USE IN OTHER MODULES
// ============================================
window.Utils = {
    sanitizeHTML,
    sanitizeInput,
    Storage,
    debounce,
    throttle,
    initLazyLoad,
    Toast,
    Modal,
    validateField,
    Validator,
    API,
    formatDate,
    formatRelativeTime,
    generateSlug,
    formatCurrency,
    supabase,
    CONFIG
};
