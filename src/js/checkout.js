/**
 * =====================================================
 * Checkout Module
 * Handle checkout form and submission to Edge Function
 * =====================================================
 */

import { EDGE_FUNCTION_URL } from './config.js';
import { isValidEmail, isValidPhone, showToast } from './utils.js';
import { getCartItems, clearCart } from './cart.js';

const form = document.getElementById('checkout-form');
const modal = document.getElementById('checkout-modal');

/**
 * Initialize checkout handlers
 */
export function initCheckout() {
    if (!form || !modal) return;

    // Form submission
    form.addEventListener('submit', handleSubmit);

    // Modal close handlers
    document.getElementById('checkout-close')?.addEventListener('click', closeModal);
    document.getElementById('checkout-overlay')?.addEventListener('click', closeModal);

    // Real-time validation
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
    });
}

/**
 * Open checkout modal
 */
export function openCheckout() {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus first field
    setTimeout(() => {
        document.getElementById('customer-name')?.focus();
    }, 100);
}

/**
 * Close checkout modal
 */
function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/**
 * Validate individual field
 */
function validateField(field) {
    const value = field.value.trim();
    const errorEl = field.parentElement.querySelector('.error-message');
    
    let isValid = true;
    let errorMessage = '';

    if (field.required && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    } else if (field.type === 'tel' && value && !isValidPhone(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
    } else if (field.minLength && value.length < field.minLength) {
        isValid = false;
        errorMessage = `Minimum ${field.minLength} characters required`;
    }

    field.classList.toggle('invalid', !isValid);
    if (errorEl) errorEl.textContent = errorMessage;

    return isValid;
}

/**
 * Validate entire form
 */
function validateForm() {
    const fields = form.querySelectorAll('[required]');
    let isValid = true;

    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Handle form submission
 */
async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        showToast('Please fill in all required fields correctly', 'error');
        return;
    }

    const cartItems = getCartItems();
    if (cartItems.length === 0) {
        showToast('Your inquiry list is empty', 'error');
        return;
    }

    // Gather form data
    const formData = new FormData(form);
    const payload = {
        customer_name: formData.get('customer_name')?.trim(),
        customer_company: formData.get('customer_company')?.trim() || null,
        customer_email: formData.get('customer_email')?.trim(),
        customer_phone: formData.get('customer_phone')?.trim(),
        customer_address: formData.get('customer_address')?.trim(),
        notes: formData.get('notes')?.trim() || null,
        items: cartItems
    };

    // Submit button state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Success
            showToast(`Inquiry submitted! Reference: ${result.order_number}`, 'success');
            
            // Clear cart and form
            clearCart();
            form.reset();
            closeModal();

            // Redirect or show confirmation after delay
            setTimeout(() => {
                window.location.hash = 'home';
            }, 2000);
        } else {
            throw new Error(result.error || 'Submission failed');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showToast(error.message || 'Failed to submit inquiry. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Export for use in app.js
export const checkoutModule = {
    init: initCheckout,
    open: openCheckout
};
