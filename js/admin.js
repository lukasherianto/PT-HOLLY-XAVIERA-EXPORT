/**
 * PT. Holly Xaviera Export - Admin Dashboard
 * Code-split from main app for performance
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        SUPABASE_URL: '',
        SUPABASE_KEY: '',
        CACHE_KEYS: {
            PRODUCTS: 'hxe_admin_products_v1',
            INQUIRIES: 'hxe_admin_inquiries_v1'
        }
    };

    // DOM Elements
    const elements = {
        statProducts: document.getElementById('stat-products'),
        statArticles: document.getElementById('stat-articles'),
        statInquiries: document.getElementById('stat-inquiries'),
        inquiriesBody: document.getElementById('inquiries-body'),
        productsBody: document.getElementById('products-body')
    };

    // Utility Functions
    function sanitizeInput(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML.trim();
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // API Functions
    async function fetchWithAuth(endpoint) {
        try {
            const response = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${endpoint}`, {
                headers: {
                    'apikey': CONFIG.SUPABASE_KEY,
                    'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'count=exact'
                }
            });

            if (!response.ok) throw new Error('API request failed');

            const count = response.headers.get('Content-Range');
            const data = await response.json();
            
            return { data, count };
        } catch (error) {
            console.error('API Error:', error);
            return { data: [], count: null };
        }
    }

    // Render Functions
    function renderStats(productsCount, articlesCount, inquiriesCount) {
        animateNumber(elements.statProducts, productsCount || 0);
        animateNumber(elements.statArticles, articlesCount || 0);
        animateNumber(elements.statInquiries, inquiriesCount || 0);
    }

    function renderInquiries(inquiries) {
        if (!inquiries || inquiries.length === 0) {
            elements.inquiriesBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No inquiries found</td>
                </tr>
            `;
            return;
        }

        elements.inquiriesBody.innerHTML = inquiries.map(inquiry => `
            <tr>
                <td>${sanitizeInput(inquiry.name)}</td>
                <td>${sanitizeInput(inquiry.email)}</td>
                <td>${sanitizeInput(inquiry.interest || 'General')}</td>
                <td>${formatDate(inquiry.created_at)}</td>
                <td>
                    <span class="status-badge status-${inquiry.status || 'new'}">
                        ${sanitizeInput(inquiry.status || 'New')}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    function renderProducts(products) {
        if (!products || products.length === 0) {
            elements.productsBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No products found</td>
                </tr>
            `;
            return;
        }

        elements.productsBody.innerHTML = products.map(product => `
            <tr>
                <td>${sanitizeInput(product.name)}</td>
                <td>${sanitizeInput(product.category || 'N/A')}</td>
                <td>${sanitizeInput(product.origin || 'Indonesia')}</td>
                <td>
                    <span class="status-badge status-${product.status}">
                        ${sanitizeInput(product.status)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm" onclick="adminEditProduct('${product.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="adminDeleteProduct('${product.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    function animateNumber(element, target) {
        if (!element) return;
        
        const duration = 1000;
        const start = 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (target - start) * easeOutQuart);
            
            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Initialize Dashboard
    async function initDashboard() {
        // Fetch counts
        const [productsRes, articlesRes, inquiriesRes] = await Promise.all([
            fetchWithAuth('products?select=id'),
            fetchWithAuth('articles?select=id'),
            fetchWithAuth('inquiries?select=id,status&status=eq.new')
        ]);

        // Update stats
        const productsCount = parseInt(productsRes.count) || 0;
        const articlesCount = parseInt(articlesRes.count) || 0;
        const inquiriesCount = parseInt(inquiriesRes.count) || 0;

        renderStats(productsCount, articlesCount, inquiriesCount);

        // Fetch recent inquiries
        const { data: inquiries } = await fetchWithAuth(
            'inquiries?select=*&order=created_at.desc&limit=10'
        );
        renderInquiries(inquiries);

        // Fetch products
        const { data: products } = await fetchWithAuth(
            'products?select=*&order=name.asc'
        );
        renderProducts(products);
    }

    // Global functions for inline event handlers
    window.adminEditProduct = function(id) {
        alert('Edit product: ' + id + '\nImplement edit modal/form here.');
    };

    window.adminDeleteProduct = async function(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
                    method: 'DELETE',
                    headers: {
                        'apikey': CONFIG.SUPABASE_KEY,
                        'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`
                    }
                });

                if (response.ok) {
                    alert('Product deleted successfully');
                    initDashboard(); // Refresh
                } else {
                    alert('Failed to delete product');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    };

    // Add Product Button Handler
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            alert('Add Product\nImplement product creation modal/form here.');
        });
    }

    // Navigation Handler
    const navLinks = document.querySelectorAll('.admin-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#') && href !== '#logout') {
                e.preventDefault();
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Update page title
                const pageTitle = document.getElementById('page-title');
                if (pageTitle) {
                    pageTitle.textContent = this.textContent;
                }
            }
        });
    });

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboard);
    } else {
        initDashboard();
    }

})();
