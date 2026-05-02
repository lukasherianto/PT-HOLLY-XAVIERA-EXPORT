/**
 * PT. Holly Xaviera Export - Cart Management
 * Handles inquiry cart with localStorage persistence
 */

const Cart = {
    STORAGE_KEY: 'holly_xaviera_cart',
    items: [],
    
    // Initialize cart from localStorage
    init() {
        this.load();
        this.updateUI();
        this.bindEvents();
    },
    
    // Load cart from localStorage
    load() {
        const stored = window.Utils.Storage.get(this.STORAGE_KEY);
        this.items = stored || [];
    },
    
    // Save cart to localStorage
    save() {
        window.Utils.Storage.set(this.STORAGE_KEY, this.items);
        this.updateUI();
    },
    
    // Add item to cart
    add(product) {
        const existingIndex = this.items.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            // Update quantity if item exists
            this.items[existingIndex].quantity += 1;
        } else {
            // Add new item
            this.items.push({
                id: product.id,
                name: product.name,
                slug: product.slug,
                category: product.category,
                moq: product.moq,
                image_url: product.image_url,
                quantity: 1
            });
        }
        
        this.save();
        window.Utils.Toast.success(`${product.name} added to inquiry cart`);
        
        // Track for analytics (optional)
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'add_to_cart',
                product: product
            });
        }
    },
    
    // Remove item from cart
    remove(productId) {
        const item = this.items.find(i => i.id === productId);
        this.items = this.items.filter(i => i.id !== productId);
        this.save();
        
        if (item) {
            window.Utils.Toast.success(`${item.name} removed from cart`);
        }
    },
    
    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.items.find(i => i.id === productId);
        if (!item) return;
        
        const qty = Math.max(1, parseInt(quantity) || 1);
        item.quantity = qty;
        
        this.save();
    },
    
    // Clear entire cart
    clear() {
        this.items = [];
        window.Utils.Storage.remove(this.STORAGE_KEY);
        this.updateUI();
    },
    
    // Get total item count
    getTotalCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    
    // Check if cart is empty
    isEmpty() {
        return this.items.length === 0;
    },
    
    // Update all cart UI elements
    updateUI() {
        // Update badge counter
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const count = this.getTotalCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
        
        // Update cart items display
        this.renderCartItems();
        
        // Update checkout button state
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.isEmpty();
        }
        
        // Update total count in cart footer
        const totalCountEl = document.getElementById('cart-total-count');
        if (totalCountEl) {
            totalCountEl.textContent = this.getTotalCount();
        }
    },
    
    // Render cart items in panel
    renderCartItems() {
        const container = document.getElementById('cart-items');
        if (!container) return;
        
        if (this.isEmpty()) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🛒</div>
                    <p>Your inquiry cart is empty</p>
                    <p style="margin-top: 0.5rem; font-size: 0.875rem;">Add products to start your inquiry</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <img 
                    src="${item.image_url || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22%3E%3Crect fill=%22%23e9ecef%22 width=%2280%22 height=%2280%22/%3E%3Ctext fill=%22%236c757d%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2212%22%3ENo Image%3C/text%3E%3C/svg%3E'}" 
                    alt="${window.Utils.sanitizeHTML(item.name)}"
                    class="cart-item-image"
                    loading="lazy"
                >
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${window.Utils.sanitizeHTML(item.name)}</h4>
                    <p class="cart-item-category">${window.Utils.sanitizeHTML(item.category)}</p>
                    <p class="cart-item-moq">MOQ: ${item.moq} units</p>
                    <div class="cart-item-controls">
                        <button type="button" class="qty-decrease" aria-label="Decrease quantity">−</button>
                        <input 
                            type="number" 
                            value="${item.quantity}" 
                            min="1" 
                            class="qty-input"
                            aria-label="Quantity"
                        >
                        <button type="button" class="qty-increase" aria-label="Increase quantity">+</button>
                        <button type="button" class="cart-item-remove" aria-label="Remove item">×</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Bind cart item events
        this.bindCartItemEvents();
    },
    
    // Bind events for cart items
    bindCartItemEvents() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;
        
        cartItemsContainer.querySelectorAll('.cart-item').forEach(item => {
            const productId = item.dataset.productId;
            
            // Decrease quantity
            item.querySelector('.qty-decrease')?.addEventListener('click', () => {
                const input = item.querySelector('.qty-input');
                const qty = Math.max(1, parseInt(input.value) - 1);
                input.value = qty;
                this.updateQuantity(productId, qty);
            });
            
            // Increase quantity
            item.querySelector('.qty-increase')?.addEventListener('click', () => {
                const input = item.querySelector('.qty-input');
                const qty = parseInt(input.value) + 1;
                input.value = qty;
                this.updateQuantity(productId, qty);
            });
            
            // Quantity input change
            item.querySelector('.qty-input')?.addEventListener('change', (e) => {
                this.updateQuantity(productId, e.target.value);
            });
            
            // Remove item
            item.querySelector('.cart-item-remove')?.addEventListener('click', () => {
                this.remove(productId);
            });
        });
    },
    
    // Bind global cart events
    bindEvents() {
        // Cart toggle button
        const cartBtn = document.querySelector('.cart-btn');
        const cartPanel = document.getElementById('cart-panel');
        const cartClose = document.querySelector('.cart-close');
        
        if (cartBtn && cartPanel) {
            cartBtn.addEventListener('click', () => {
                Modal.open('cart-panel');
            });
        }
        
        if (cartClose && cartPanel) {
            cartClose.addEventListener('click', () => {
                Modal.close('cart-panel');
            });
        }
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (!this.isEmpty()) {
                    Modal.close('cart-panel');
                    Modal.open('checkout-modal');
                }
            });
        }
        
        // Checkout form submission
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Modal cancel buttons
        document.querySelectorAll('.modal-cancel').forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    Modal.close(modal.id);
                }
            });
        });
        
        // Success modal close
        const successCloseBtn = document.getElementById('success-close-btn');
        if (successCloseBtn) {
            successCloseBtn.addEventListener('click', () => {
                Modal.close('success-modal');
                window.location.hash = '#products';
            });
        }
    },
    
    // Handle checkout form submission
    async handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = document.getElementById('submit-order-btn');
        
        // Validate required fields
        const nameInput = document.getElementById('customer-name');
        const emailInput = document.getElementById('customer-email');
        const addressInput = document.getElementById('customer-address');
        
        const isNameValid = window.Utils.validateField(nameInput, ['required']);
        const isEmailValid = window.Utils.validateField(emailInput, ['required', 'email']);
        const isAddressValid = window.Utils.validateField(addressInput, ['required']);
        
        if (!isNameValid || !isEmailValid || !isAddressValid) {
            window.Utils.Toast.error('Please fill in all required fields');
            return;
        }
        
        // Gather form data
        const customerData = {
            name: nameInput.value.trim(),
            company: document.getElementById('customer-company').value.trim(),
            email: emailInput.value.trim().toLowerCase(),
            phone: document.getElementById('customer-phone').value.trim(),
            address: addressInput.value.trim()
        };
        
        const notes = document.getElementById('order-notes').value.trim();
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        try {
            // Submit order via Edge Function
            const result = await window.Utils.API.submitOrder({
                customer: customerData,
                items: this.items,
                notes: notes
            });
            
            // Success
            window.Utils.Toast.success('Inquiry submitted successfully!');
            
            // Clear cart
            this.clear();
            
            // Reset form
            form.reset();
            
            // Show success modal
            document.getElementById('success-order-number').textContent = result.order_number;
            Modal.close('checkout-modal');
            Modal.open('success-modal');
            
        } catch (error) {
            window.Utils.Toast.error(error.message || 'Failed to submit inquiry. Please try again.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Inquiry';
        }
    }
};

// Export for use in other modules
window.Cart = Cart;
