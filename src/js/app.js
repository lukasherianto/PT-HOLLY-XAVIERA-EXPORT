/**
 * =====================================================
 * Main Application Entry Point
 * PT. Holly Xaviera Export - B2B E-commerce Site
 * =====================================================
 */

import { initCart, isCartEmpty } from './cart.js';
import { fetchProducts, getCategories, filterProducts, renderProducts } from './products.js';
import { initCheckout, openCheckout } from './checkout.js';
import { debounce, initLazyLoading } from './utils.js';

// DOM Elements
const elements = {};

/**
 * Initialize application
 */
async function initApp() {
    // Cache DOM elements
    cacheElements();
    
    // Initialize modules
    initCart();
    initCheckout();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load data
    await loadInitialData();
    
    // Hide loading screen
    hideLoading();
}

/**
 * Cache DOM elements for performance
 */
function cacheElements() {
    elements.cartToggle = document.getElementById('cart-toggle');
    elements.cartPanel = document.getElementById('cart-panel');
    elements.cartOverlay = document.getElementById('cart-overlay');
    elements.cartClose = document.getElementById('cart-close');
    elements.checkoutBtn = document.getElementById('checkout-btn');
    elements.navToggle = document.querySelector('.nav-toggle');
    elements.navMenu = document.querySelector('.nav-menu');
    elements.productSearch = document.getElementById('product-search');
    elements.categoryFilter = document.getElementById('category-filter');
    elements.heroTitle = document.getElementById('hero-title');
    elements.heroSubtitle = document.getElementById('hero-subtitle');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Cart panel toggle
    elements.cartToggle?.addEventListener('click', toggleCart);
    elements.cartClose?.addEventListener('click', closeCart);
    elements.cartOverlay?.addEventListener('click', closeCart);
    
    // Checkout button
    elements.checkoutBtn?.addEventListener('click', handleCheckoutClick);
    
    // Mobile navigation
    elements.navToggle?.addEventListener('click', toggleNav);
    
    // Product filtering with debounce
    if (elements.productSearch) {
        elements.productSearch.addEventListener('input', 
            debounce(handleProductFilter, 300)
        );
    }
    
    if (elements.categoryFilter) {
        elements.categoryFilter.addEventListener('change', handleProductFilter);
    }
    
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                smoothScrollTo(href);
                closeMobileNav();
            }
        });
    });
    
    // Close cart on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
        }
    });
}

/**
 * Load initial data from Supabase
 */
async function loadInitialData() {
    try {
        // Fetch products
        await fetchProducts();
        
        // Populate category filter
        populateCategories();
        
        // Render products
        renderProducts();
        
        // Load banners and content
        await loadBanners();
        await loadPageContent();
        
    } catch (error) {
        console.error('Failed to load initial data:', error);
    }
}

/**
 * Populate category dropdown
 */
function populateCategories() {
    const categories = getCategories();
    if (!elements.categoryFilter) return;
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        elements.categoryFilter.appendChild(option);
    });
}

/**
 * Handle product filtering
 */
function handleProductFilter() {
    const searchTerm = elements.productSearch?.value || '';
    const category = elements.categoryFilter?.value || '';
    
    const filtered = filterProducts(searchTerm, category);
    renderProducts(filtered);
}

/**
 * Toggle cart panel
 */
function toggleCart() {
    const isOpen = elements.cartPanel?.classList.contains('active');
    if (isOpen) {
        closeCart();
    } else {
        openCart();
    }
}

/**
 * Open cart panel
 */
function openCart() {
    elements.cartPanel?.classList.add('active');
    elements.cartPanel?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

/**
 * Close cart panel
 */
function closeCart() {
    elements.cartPanel?.classList.remove('active');
    elements.cartPanel?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/**
 * Handle checkout button click
 */
function handleCheckoutClick() {
    if (!isCartEmpty()) {
        closeCart();
        openCheckout();
    }
}

/**
 * Toggle mobile navigation
 */
function toggleNav() {
    const isOpen = elements.navMenu?.classList.contains('active');
    if (isOpen) {
        closeMobileNav();
    } else {
        openMobileNav();
    }
}

/**
 * Open mobile nav
 */
function openMobileNav() {
    elements.navMenu?.classList.add('active');
    elements.navToggle?.setAttribute('aria-expanded', 'true');
}

/**
 * Close mobile nav
 */
function closeMobileNav() {
    elements.navMenu?.classList.remove('active');
    elements.navToggle?.setAttribute('aria-expanded', 'false');
}

/**
 * Smooth scroll to element
 */
function smoothScrollTo(selector) {
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

/**
 * Load banners from Supabase
 */
async function loadBanners() {
    try {
        const SUPABASE_URL = 'https://your-project.supabase.co';
        const SUPABASE_ANON_KEY = 'your-anon-key';
        
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/banners?select=section,title,subtitle&is_active=eq.true`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            }
        );
        
        if (response.ok) {
            const banners = await response.json();
            const heroBanner = banners.find(b => b.section === 'hero');
            
            if (heroBanner) {
                if (elements.heroTitle) elements.heroTitle.textContent = heroBanner.title;
                if (elements.heroSubtitle) elements.heroSubtitle.textContent = heroBanner.subtitle;
            }
        }
    } catch (error) {
        // Silent fail for banners
    }
}

/**
 * Load page content from Supabase
 */
async function loadPageContent() {
    try {
        const SUPABASE_URL = 'https://your-project.supabase.co';
        const SUPABASE_ANON_KEY = 'your-anon-key';
        
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/page_contents?select=page_key,content`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            }
        );
        
        if (response.ok) {
            const contents = await response.json();
            
            contents.forEach(item => {
                if (item.page_key === 'about') {
                    const aboutEl = document.getElementById('about-content');
                    if (aboutEl && item.content?.content) {
                        aboutEl.innerHTML = item.content.content;
                    }
                }
                
                if (item.page_key === 'contact') {
                    const contactEl = document.getElementById('contact-content');
                    if (contactEl && item.content) {
                        contactEl.innerHTML = `
                            <div style="display:grid;gap:1rem;max-width:500px;margin:0 auto;">
                                <p><strong>Email:</strong> ${item.content.email || ''}</p>
                                <p><strong>Phone:</strong> ${item.content.phone || ''}</p>
                                <p><strong>Address:</strong> ${item.content.address || ''}</p>
                            </div>
                        `;
                    }
                }
                
                if (item.page_key === 'footer') {
                    const copyrightEl = document.getElementById('footer-copyright');
                    if (copyrightEl && item.content?.copyright) {
                        copyrightEl.textContent = item.content.copyright;
                    }
                }
            });
        }
    } catch (error) {
        // Silent fail for content
    }
}

/**
 * Hide loading screen
 */
function hideLoading() {
    const loading = document.getElementById('app-loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
