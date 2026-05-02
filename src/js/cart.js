/**
 * =====================================================
 * Shopping Cart Module
 * Handles inquiry cart with localStorage persistence
 * =====================================================
 */

import { STORAGE_KEYS } from './config.js';
import { showToast } from './utils.js';

// Cart state
let cart = [];

/**
 * Initialize cart from localStorage
 */
export function initCart() {
    try {
        const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (e) {
        cart = [];
    }
    updateCartUI();
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    updateCartUI();
}

/**
 * Add item to cart
 * @param {Object} product - Product to add
 * @param {number} quantity - Quantity
 */
export function addToCart(product, quantity = 1) {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            slug: product.slug,
            category: product.category,
            moq: product.moq,
            image_url: product.image_url,
            quantity: quantity
        });
    }
    
    saveCart();
    showToast(`${product.name} added to inquiry list`, 'success');
}

/**
 * Remove item from cart
 * @param {string} productId - Product ID
 */
export function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

/**
 * Update item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 */
export function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, parseInt(quantity) || 1);
        saveCart();
    }
}

/**
 * Clear entire cart
 */
export function clearCart() {
    cart = [];
    saveCart();
}

/**
 * Get cart items
 * @returns {Array} Cart items
 */
export function getCartItems() {
    return [...cart];
}

/**
 * Get cart count
 * @returns {number} Total items in cart
 */
export function getCartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Check if cart is empty
 * @returns {boolean} Is empty
 */
export function isCartEmpty() {
    return cart.length === 0;
}

/**
 * Update cart UI elements
 */
function updateCartUI() {
    // Update badge count
    const badge = document.getElementById('cart-count');
    if (badge) {
        const count = getCartCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
    
    // Update checkout button state
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = isCartEmpty();
    }
    
    // Render cart items
    renderCartItems();
}

/**
 * Render cart items in panel
 */
function renderCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    
    if (isCartEmpty()) {
        container.innerHTML = `
            <div class="cart-empty">
                <p>Your inquiry list is empty</p>
                <p style="margin-top: 8px; font-size: 14px;">Browse products and add items to request a quote</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image_url || ''}" alt="${sanitize(item.name)}" class="cart-item-image" loading="lazy">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${sanitize(item.name)}</h4>
                <p class="cart-item-category">${sanitize(item.category)}</p>
                <p class="cart-item-moq">MOQ: ${item.moq} units</p>
                <div class="cart-item-controls">
                    <button class="qty-btn decrease" aria-label="Decrease quantity">-</button>
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" aria-label="Quantity">
                    <button class="qty-btn increase" aria-label="Increase quantity">+</button>
                    <button class="cart-item-remove" aria-label="Remove item">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Attach event listeners
    attachCartListeners();
}

/**
 * Sanitize string for display
 */
function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

/**
 * Attach event listeners to cart items
 */
function attachCartListeners() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    
    // Decrease quantity
    container.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item.dataset.id;
            const input = item.querySelector('.qty-input');
            const newQty = Math.max(1, parseInt(input.value) - 1);
            updateQuantity(id, newQty);
        });
    });
    
    // Increase quantity
    container.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item.dataset.id;
            const input = item.querySelector('.qty-input');
            updateQuantity(id, parseInt(input.value) + 1);
        });
    });
    
    // Quantity input change
    container.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item.dataset.id;
            updateQuantity(id, e.target.value);
        });
    });
    
    // Remove item
    container.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item.dataset.id;
            removeFromCart(id);
        });
    });
}

// Export for use in app.js
export const cartModule = {
    init: initCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItems,
    getCartCount,
    isCartEmpty
};
