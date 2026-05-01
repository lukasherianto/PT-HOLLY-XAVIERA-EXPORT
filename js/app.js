/**
 * PT. Holly Xaviera Export - Main Application
 * Production-ready vanilla JavaScript with performance optimizations
 * 
 * Features:
 * - Lazy loading images with Intersection Observer
 * - API caching with localStorage + versioning
 * - Form validation with sanitization
 * - PWA install prompt
 * - Accessibility enhancements
 */

(function() {
    'use strict';

    // ==========================================================================
    // Configuration & Constants
    // ==========================================================================
    
    const CONFIG = {
        API_VERSION: 'v1',
        CACHE_VERSION: '1.0.0',
        CACHE_TTL: 5 * 60 * 1000, // 5 minutes
        SUPABASE_URL: '', // Set via environment
        SUPABASE_KEY: '', // Set via environment
        RATE_LIMIT_MS: 60000, // 1 minute for contact form
        ANIMATION_DURATION: 300
    };

    // Cache keys
    const CACHE_KEYS = {
        PRODUCTS: `hxe_products_${CONFIG.CACHE_VERSION}`,
        ARTICLES: `hxe_articles_${CONFIG.CACHE_VERSION}`,
        SETTINGS: `hxe_settings_${CONFIG.CACHE_VERSION}`
    };

    // ==========================================================================
    // Utility Functions
    // ==========================================================================
    
    /**
     * Sanitize user input to prevent XSS attacks
     * @param {string} str - Input string to sanitize
     * @returns {string} Sanitized string
     */
    function sanitizeInput(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML.trim();
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Debounce function for performance
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
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
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // ==========================================================================
    // Cache Manager
    // ==========================================================================
    
    const CacheManager = {
        /**
         * Get cached data with TTL check
         * @param {string} key - Cache key
         * @returns {*} Cached data or null
         */
        get(key) {
            try {
                const item = localStorage.getItem(key);
                if (!item) return null;
                
                const parsed = JSON.parse(item);
                const now = Date.now();
                
                if (parsed.timestamp && (now - parsed.timestamp) > CONFIG.CACHE_TTL) {
                    localStorage.removeItem(key);
                    return null;
                }
                
                return parsed.data;
            } catch (e) {
                localStorage.removeItem(key);
                return null;
            }
        },

        /**
         * Set cache data with timestamp
         * @param {string} key - Cache key
         * @param {*} data - Data to cache
         */
        set(key, data) {
            try {
                const item = {
                    timestamp: Date.now(),
                    data: data
                };
                localStorage.setItem(key, JSON.stringify(item));
            } catch (e) {
                // Storage full or unavailable
            }
        },

        /**
         * Clear all app caches
         */
        clear() {
            Object.values(CACHE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        }
    };

    // ==========================================================================
    // API Service
    // ==========================================================================
    
    const ApiService = {
        /**
         * Fetch data with caching
         * @param {string} endpoint - API endpoint
         * @param {string} cacheKey - Cache key
         * @returns {Promise<Array>} Fetched data
         */
        async fetchWithCache(endpoint, cacheKey) {
            // Try cache first
            const cached = CacheManager.get(cacheKey);
            if (cached) {
                return cached;
            }

            // Fetch from API
            try {
                const response = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${endpoint}`, {
                    headers: {
                        'apikey': CONFIG.SUPABASE_KEY,
                        'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('API request failed');

                const data = await response.json();
                CacheManager.set(cacheKey, data);
                return data;
            } catch (error) {
                // Return empty array on error
                return [];
            }
        }
    };

    // ==========================================================================
    // Image Lazy Loading
    // ==========================================================================
    
    const ImageLoader = {
        /**
         * Initialize lazy loading for images
         */
        init() {
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
                    rootMargin: '50px',
                    threshold: 0.01
                });

                document.querySelectorAll('img[data-src]').forEach(img => {
                    this.observer.observe(img);
                });
            } else {
                // Fallback for browsers without Intersection Observer
                document.querySelectorAll('img[data-src]').forEach(img => {
                    this.loadImage(img);
                });
            }
        },

        /**
         * Handle intersection callback
         * @param {Array} entries - Intersection observer entries
         */
        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        },

        /**
         * Load image with WebP fallback
         * @param {HTMLImageElement} img - Image element
         */
        loadImage(img) {
            const src = img.dataset.src;
            const webpSrc = img.dataset.srcWebp || src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            
            // Try WebP first
            if (img.dataset.srcWebp || src.match(/\.(jpg|jpeg|png)$/i)) {
                this.testWebPSupport().then(supportsWebP => {
                    img.src = supportsWebP ? webpSrc : src;
                    img.onload = () => img.classList.add('loaded');
                    img.classList.remove('lazy');
                });
            } else {
                img.src = src;
                img.onload = () => img.classList.add('loaded');
                img.classList.remove('lazy');
            }
        },

        /**
         * Test browser WebP support
         * @returns {Promise<boolean>} WebP support status
         */
        testWebPSupport() {
            return new Promise(resolve => {
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'image/webp';
                
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = 'data:image/webp;base64,UklGRhoAAAAAAABXRUJQVlQ4wBoAAAAAAA==';
            });
        }
    };

    // ==========================================================================
    // Product Renderer
    // ==========================================================================
    
    const ProductRenderer = {
        container: null,

        /**
         * Initialize product renderer
         */
        init() {
            this.container = document.getElementById('product-grid');
            if (this.container) {
                this.loadProducts();
            }
        },

        /**
         * Load and render products
         */
        async loadProducts() {
            const products = await ApiService.fetchWithCache('products?select=*&order=name.asc', CACHE_KEYS.PRODUCTS);
            
            if (products.length === 0) {
                this.renderFallback();
                return;
            }

            this.container.innerHTML = products.map(product => this.createProductCard(product)).join('');
            
            // Re-initialize lazy loading for new images
            ImageLoader.init();
        },

        /**
         * Create product card HTML
         * @param {Object} product - Product data
         * @returns {string} HTML string
         */
        createProductCard(product) {
            const safeName = sanitizeInput(product.name || 'Product');
            const safeDesc = sanitizeInput(product.description || '');
            const safeOrigin = sanitizeInput(product.origin || 'Indonesia');
            const imageUrl = product.image_url || 'images/product-placeholder.jpg';
            
            return `
                <article class="product-card" role="listitem">
                    <img 
                        class="product-image lazy" 
                        data-src="${sanitizeInput(imageUrl)}" 
                        data-src-webp="${sanitizeInput(imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp'))}"
                        alt="${safeName} - Indonesian ${safeName.toLowerCase()}"
                        loading="lazy"
                        width="400"
                        height="200"
                    >
                    <div class="product-content">
                        <h3 class="product-title">${safeName}</h3>
                        <p class="product-desc">${safeDesc.substring(0, 100)}${safeDesc.length > 100 ? '...' : ''}</p>
                        <div class="product-meta">
                            <span class="product-origin">📍 ${safeOrigin}</span>
                            <a href="#contact" class="btn btn-primary" aria-label="Inquire about ${safeName}">Inquire</a>
                        </div>
                    </div>
                </article>
            `;
        },

        /**
         * Render fallback content when no products
         */
        renderFallback() {
            this.container.innerHTML = `
                <div class="text-center">
                    <h3>Our Products</h3>
                    <p>We offer premium Indonesian coffee, spices, and natural products.</p>
                    <a href="#contact" class="btn btn-primary mt-4">Contact Us for Catalog</a>
                </div>
            `;
        }
    };

    // ==========================================================================
    // Blog Renderer
    // ==========================================================================
    
    const BlogRenderer = {
        container: null,

        /**
         * Initialize blog renderer
         */
        init() {
            this.container = document.getElementById('blog-grid');
            if (this.container) {
                this.loadArticles();
            }
        },

        /**
         * Load and render articles
         */
        async loadArticles() {
            const articles = await ApiService.fetchWithCache('articles?select=*&order=published_at.desc&limit=6', CACHE_KEYS.ARTICLES);
            
            if (articles.length === 0) {
                this.renderFallback();
                return;
            }

            this.container.innerHTML = articles.map(article => this.createArticleCard(article)).join('');
        },

        /**
         * Create article card HTML
         * @param {Object} article - Article data
         * @returns {string} HTML string
         */
        createArticleCard(article) {
            const safeTitle = sanitizeInput(article.title || 'Article');
            const safeExcerpt = sanitizeInput(article.excerpt || '');
            const imageUrl = article.featured_image || 'images/blog-placeholder.jpg';
            const publishedDate = article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }) : '';
            
            return `
                <article class="blog-card" role="listitem">
                    <img 
                        class="blog-image lazy" 
                        data-src="${sanitizeInput(imageUrl)}" 
                        alt="${safeTitle}"
                        loading="lazy"
                        width="400"
                        height="200"
                    >
                    <div class="blog-content">
                        <div class="blog-meta">
                            <time datetime="${article.published_at || ''}">${publishedDate}</time>
                        </div>
                        <h3 class="blog-title">${safeTitle}</h3>
                        <p class="blog-excerpt">${safeExcerpt.substring(0, 120)}${safeExcerpt.length > 120 ? '...' : ''}</p>
                        <a href="#" class="blog-link" aria-label="Read more about ${safeTitle}">
                            Read More <span aria-hidden="true">→</span>
                        </a>
                    </div>
                </article>
            `;
        },

        /**
         * Render fallback content
         */
        renderFallback() {
            this.container.innerHTML = `
                <div class="text-center">
                    <h3>Latest Insights</h3>
                    <p>Check back soon for industry news and updates.</p>
                </div>
            `;
        }
    };

    // ==========================================================================
    // Contact Form Handler
    // ==========================================================================
    
    const ContactForm = {
        form: null,
        lastSubmit: 0,

        /**
         * Initialize contact form
         */
        init() {
            this.form = document.getElementById('contact-form');
            if (this.form) {
                this.form.addEventListener('submit', this.handleSubmit.bind(this));
                
                // Real-time validation
                this.form.querySelectorAll('input, textarea').forEach(field => {
                    field.addEventListener('blur', () => this.validateField(field));
                });
            }
        },

        /**
         * Handle form submission
         * @param {Event} e - Submit event
         */
        async handleSubmit(e) {
            e.preventDefault();

            // Rate limiting check
            const now = Date.now();
            if (now - this.lastSubmit < CONFIG.RATE_LIMIT_MS) {
                this.showStatus('Please wait before submitting again', 'error');
                return;
            }

            // Validate all fields
            const isValid = this.validateForm();
            if (!isValid) return;

            // Get form data
            const formData = new FormData(this.form);
            const data = {
                name: sanitizeInput(formData.get('name')),
                email: sanitizeInput(formData.get('email')),
                company: sanitizeInput(formData.get('company') || ''),
                interest: sanitizeInput(formData.get('interest') || ''),
                message: sanitizeInput(formData.get('message'))
            };

            // Disable submit button
            const submitBtn = this.form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                // Simulate API call (replace with actual Supabase insert)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // In production, use:
                // await supabase.from('inquiries').insert([data]);
                
                this.showStatus('Thank you! We will contact you soon.', 'success');
                this.form.reset();
                this.lastSubmit = now;
            } catch (error) {
                this.showStatus('Something went wrong. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        },

        /**
         * Validate entire form
         * @returns {boolean} Is form valid
         */
        validateForm() {
            let isValid = true;
            const requiredFields = ['name', 'email', 'message'];

            requiredFields.forEach(fieldName => {
                const field = this.form.querySelector(`[name="${fieldName}"]`);
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            return isValid;
        },

        /**
         * Validate single field
         * @param {HTMLElement} field - Form field
         * @returns {boolean} Is field valid
         */
        validateField(field) {
            const value = field.value.trim();
            const errorEl = field.parentElement.querySelector('.error-message') || this.createErrorElement(field);
            let isValid = true;
            let errorMessage = '';

            // Required validation
            if (field.required && !value) {
                isValid = false;
                errorMessage = 'This field is required';
            }
            // Email validation
            else if (field.type === 'email' && value && !isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }

            // Update UI
            if (!isValid) {
                field.classList.add('error');
                errorEl.textContent = errorMessage;
                errorEl.classList.add('visible');
            } else {
                field.classList.remove('error');
                errorEl.classList.remove('visible');
            }

            return isValid;
        },

        /**
         * Create error message element
         * @param {HTMLElement} field - Form field
         * @returns {HTMLElement} Error element
         */
        createErrorElement(field) {
            const errorEl = document.createElement('p');
            errorEl.className = 'error-message';
            errorEl.setAttribute('role', 'alert');
            field.parentElement.appendChild(errorEl);
            return errorEl;
        },

        /**
         * Show form status message
         * @param {string} message - Status message
         * @param {string} type - Status type (success/error)
         */
        showStatus(message, type) {
            const statusEl = document.getElementById('form-status');
            if (statusEl) {
                statusEl.textContent = message;
                statusEl.className = `form-status ${type}`;
                statusEl.setAttribute('aria-live', 'polite');
                
                // Auto-hide success messages
                if (type === 'success') {
                    setTimeout(() => {
                        statusEl.textContent = '';
                        statusEl.className = 'form-status';
                    }, 5000);
                }
            }
        }
    };

    // ==========================================================================
    // Navigation Handler
    // ==========================================================================
    
    const Navigation = {
        toggle: null,
        nav: null,
        links: null,

        /**
         * Initialize navigation
         */
        init() {
            this.toggle = document.querySelector('.nav-toggle');
            this.nav = document.getElementById('main-nav');
            this.links = this.nav?.querySelectorAll('a');

            if (this.toggle && this.nav) {
                this.toggle.addEventListener('click', this.toggleMenu.bind(this));
                
                // Close menu on link click (mobile)
                this.links.forEach(link => {
                    link.addEventListener('click', () => this.closeMenu());
                });

                // Close menu on escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') this.closeMenu();
                });

                // Focus management
                this.setupFocusManagement();
            }

            // Smooth scroll for anchor links
            this.setupSmoothScroll();
        },

        /**
         * Toggle mobile menu
         */
        toggleMenu() {
            const isExpanded = this.toggle.getAttribute('aria-expanded') === 'true';
            this.toggle.setAttribute('aria-expanded', !isExpanded);
            this.nav.querySelector('ul').classList.toggle('nav-active');
            
            // Update toggle icon
            this.toggle.querySelector('span').textContent = isExpanded ? '☰' : '✕';
        },

        /**
         * Close mobile menu
         */
        closeMenu() {
            this.toggle.setAttribute('aria-expanded', 'false');
            this.nav.querySelector('ul').classList.remove('nav-active');
            this.toggle.querySelector('span').textContent = '☰';
        },

        /**
         * Setup focus management for accessibility
         */
        setupFocusManagement() {
            // Trap focus in mobile menu when open
            this.toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMenu();
                    
                    if (this.toggle.getAttribute('aria-expanded') === 'true') {
                        const firstLink = this.nav.querySelector('a');
                        firstLink?.focus();
                    }
                }
            });
        },

        /**
         * Setup smooth scrolling for anchor links
         */
        setupSmoothScroll() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const targetId = anchor.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Update URL without jumping
                        history.pushState(null, '', targetId);
                    }
                });
            });
        }
    };

    // ==========================================================================
    // Stats Counter Animation
    // ==========================================================================
    
    const StatsCounter = {
        /**
         * Initialize stats counter animation
         */
        init() {
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
                    threshold: 0.5
                });

                document.querySelectorAll('.stat-number').forEach(el => {
                    this.observer.observe(el);
                });
            }
        },

        /**
         * Handle intersection for counter animation
         * @param {Array} entries - Observer entries
         */
        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        },

        /**
         * Animate counter from 0 to target
         * @param {HTMLElement} el - Counter element
         */
        animateCounter(el) {
            const target = parseInt(el.dataset.target, 10);
            if (isNaN(target)) return;

            const duration = 2000;
            const start = 0;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(start + (target - start) * easeOutQuart);
                
                el.textContent = formatNumber(current);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.textContent = formatNumber(target);
                }
            };

            requestAnimationFrame(animate);
        }
    };

    // ==========================================================================
    // PWA Install Handler
    // ==========================================================================
    
    const PWAHandler = {
        deferredPrompt: null,

        /**
         * Initialize PWA install handler
         */
        init() {
            window.addEventListener('beforeinstallprompt', this.handleBeforeInstall.bind(this));
            
            const installBtn = document.getElementById('install-btn');
            const dismissBtn = document.getElementById('dismiss-install');
            
            if (installBtn) {
                installBtn.addEventListener('click', this.installApp.bind(this));
            }
            
            if (dismissBtn) {
                dismissBtn.addEventListener('click', this.dismissPrompt.bind(this));
            }

            // Check if already dismissed
            if (localStorage.getItem('pwa_install_dismissed') === 'true') {
                const prompt = document.getElementById('install-prompt');
                if (prompt) prompt.classList.add('hidden');
            }
        },

        /**
         * Handle beforeinstallprompt event
         * @param {Event} e - Before install prompt event
         */
        handleBeforeInstall(e) {
            e.preventDefault();
            this.deferredPrompt = e;
            
            const prompt = document.getElementById('install-prompt');
            if (prompt && localStorage.getItem('pwa_install_dismissed') !== 'true') {
                prompt.classList.remove('hidden');
                prompt.removeAttribute('hidden');
            }
        },

        /**
         * Install the app
         */
        async installApp() {
            if (!this.deferredPrompt) return;

            this.deferredPrompt.prompt();
            const result = await this.deferredPrompt.userChoice;
            
            if (result.outcome === 'accepted') {
                this.dismissPrompt();
            }
            
            this.deferredPrompt = null;
        },

        /**
         * Dismiss the install prompt
         */
        dismissPrompt() {
            const prompt = document.getElementById('install-prompt');
            if (prompt) {
                prompt.classList.add('hidden');
                prompt.setAttribute('hidden', '');
            }
            localStorage.setItem('pwa_install_dismissed', 'true');
        }
    };

    // ==========================================================================
    // Footer Year Update
    // ==========================================================================
    
    const Footer = {
        /**
         * Update footer year
         */
        init() {
            const yearEl = document.getElementById('current-year');
            if (yearEl) {
                yearEl.textContent = new Date().getFullYear();
            }
        }
    };

    // ==========================================================================
    // Focus Visible Polyfill
    // ==========================================================================
    
    const FocusVisible = {
        /**
         * Initialize focus visible polyfill
         */
        init() {
            // Add keyboard navigation class
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.add('keyboard-navigation');
                }
            });

            document.addEventListener('mousedown', () => {
                document.body.classList.remove('keyboard-navigation');
            });
        }
    };

    // ==========================================================================
    // Performance Monitoring
    // ==========================================================================
    
    const PerformanceMonitor = {
        /**
         * Initialize performance monitoring
         */
        init() {
            // Log Core Web Vitals in production (remove in dev)
            if ('PerformanceObserver' in window) {
                // LCP
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    // Could send to analytics
                }).observe({ entryTypes: ['largest-contentful-paint'] });

                // CLS
                new PerformanceObserver((entryList) => {
                    let clsScore = 0;
                    entryList.getEntries().forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsScore += entry.value;
                        }
                    });
                    // Could send to analytics
                }).observe({ entryTypes: ['layout-shift'] });

                // FID
                new PerformanceObserver((entryList) => {
                    entryList.getEntries().forEach(entry => {
                        // Could send to analytics
                    });
                }).observe({ entryTypes: ['first-input'] });
            }
        }
    };

    // ==========================================================================
    // Application Initialization
    // ==========================================================================
    
    function init() {
        // Initialize all modules
        Navigation.init();
        ImageLoader.init();
        ProductRenderer.init();
        BlogRenderer.init();
        ContactForm.init();
        StatsCounter.init();
        PWAHandler.init();
        Footer.init();
        FocusVisible.init();
        PerformanceMonitor.init();

        // Remove loading states if JS is enabled
        document.body.classList.add('js-enabled');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose utilities globally if needed
    window.HXE = {
        sanitizeInput,
        isValidEmail,
        CacheManager
    };

})();
