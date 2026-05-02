/**
 * =====================================================
 * Products Module
 * Fetch and render products from Supabase
 * =====================================================
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY, DEFAULT_IMAGES } from './config.js';
import { cache, debounce, initLazyLoading } from './utils.js';
import { addToCart } from './cart.js';

const BASE_URL = `${SUPABASE_URL}/rest/v1`;
const HEADERS = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
};

let allProducts = [];
let categories = new Set();

/**
 * Fetch products from Supabase
 */
export async function fetchProducts() {
    // Check cache first
    const cached = cache.get('products');
    if (cached) {
        allProducts = cached;
        extractCategories();
        return allProducts;
    }

    try {
        const response = await fetch(`${BASE_URL}/products?select=id,name,slug,category,moq,description,image_url,is_active&is_active=eq.true&order=name.asc`, {
            headers: HEADERS
        });

        if (!response.ok) throw new Error('Failed to fetch products');

        allProducts = await response.json();
        cache.set('products', allProducts);
        extractCategories();
        return allProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

/**
 * Extract unique categories
 */
function extractCategories() {
    categories.clear();
    allProducts.forEach(p => categories.add(p.category));
}

/**
 * Get all categories
 */
export function getCategories() {
    return Array.from(categories).sort();
}

/**
 * Filter products by search and category
 */
export function filterProducts(searchTerm = '', category = '') {
    return allProducts.filter(product => {
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !category || product.category === category;
        
        return matchesSearch && matchesCategory;
    });
}

/**
 * Render products grid
 */
export function renderProducts(products = allProducts, containerId = 'product-grid') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center;grid-column:1/-1;">No products found</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <article class="product-card" data-id="${product.id}">
            <img src="${product.image_url || DEFAULT_IMAGES.PRODUCT}" 
                 alt="${escapeHTML(product.name)}" 
                 class="product-image" 
                 loading="lazy">
            <div class="product-info">
                <span class="product-category">${escapeHTML(product.category)}</span>
                <h3 class="product-name">${escapeHTML(product.name)}</h3>
                <p class="product-description">${escapeHTML(product.description || '')}</p>
                <p class="product-moq">MOQ: ${product.moq} units</p>
                <div class="product-actions">
                    <button class="btn-add-to-cart" onclick="window.handleAddToCart('${product.id}')">
                        Add to Inquiry
                    </button>
                </div>
            </div>
        </article>
    `).join('');

    initLazyLoading(`#${containerId}`);
}

/**
 * Escape HTML for safe display
 */
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Make addToCart accessible globally for inline handlers
window.handleAddToCart = (productId) => {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        addToCart(product, 1);
    }
};
