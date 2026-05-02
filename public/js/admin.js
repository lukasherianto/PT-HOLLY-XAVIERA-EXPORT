/**
 * PT. Holly Xaviera Export - Admin Dashboard
 * Comprehensive admin panel for managing content
 */

// CONFIG must be available before Admin uses it
const CONFIG = {
    SUPABASE_URL: (typeof window !== 'undefined' && window.env && window.env.SUPABASE_URL) || 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: (typeof window !== 'undefined' && window.env && window.env.SUPABASE_ANON_KEY) || 'YOUR_SUPABASE_ANON_KEY',
    EDGE_FUNCTION_URL: (typeof window !== 'undefined' && window.env && window.env.EDGE_FUNCTION_URL) || 'https://YOUR_PROJECT.supabase.co/functions/v1/submit-order'
};

const Admin = {
    state: {
        user: null,
        currentTab: 'orders',
        orders: [],
        products: [],
        articles: [],
        banners: [],
        settings: null,
        pageContents: null
    },
    
    async init() {
        // Ensure Utils is available
        if (!window.Utils || !window.Utils.Storage) {
            console.error('Utils not initialized');
            return;
        }
        
        // Check if already logged in
        const savedUser = window.Utils.Storage.get('admin_user');
        if (savedUser) {
            this.state.user = savedUser;
            this.showDashboard();
        } else {
            this.showLogin();
        }
        
        this.bindEvents();
    },
    
    showLogin() {
        window.Utils.Modal.open('admin-login-modal');
        
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.onsubmit = (e) => this.handleLogin(e);
        }
    },
    
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        try {
            const { data, error } = await window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY).auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Check if user is admin
            const { data: profile } = await window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
                .from('admin_profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            
            if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
                throw new Error('Access denied. Admin privileges required.');
            }
            
            this.state.user = {
                id: data.user.id,
                email: data.user.email,
                role: profile.role
            };
            
            window.Utils.Storage.set('admin_user', this.state.user);
            window.Utils.Modal.close('admin-login-modal');
            window.Utils.Toast.success('Welcome back!');
            this.showDashboard();
            
        } catch (error) {
            window.Utils.Toast.error(error.message || 'Login failed');
        }
    },
    
    async showDashboard() {
        const dashboard = document.getElementById('admin-dashboard');
        if (!dashboard) return;
        
        dashboard.setAttribute('aria-hidden', 'false');
        
        // Load initial data
        await Promise.all([
            this.loadOrders(),
            this.loadProducts(),
            this.loadBanners(),
            this.loadSettings(),
            this.loadPageContents()
        ]);
        
        this.renderTab('orders');
    },
    
    hideDashboard() {
        const dashboard = document.getElementById('admin-dashboard');
        if (dashboard) {
            dashboard.setAttribute('aria-hidden', 'true');
        }
        window.location.hash = '#home';
    },
    
    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.dataset.tab;
                this.renderTab(tab);
            });
        });
        
        // Close button
        const closeBtn = document.getElementById('admin-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideDashboard());
        }
        
        // Logout button
        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    },
    
    async handleLogout() {
        try {
            await window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY).auth.signOut();
            window.Utils.Storage.remove('admin_user');
            this.state.user = null;
            window.Utils.Toast.success('Logged out successfully');
            this.hideDashboard();
        } catch (error) {
            window.Utils.Toast.error('Logout failed');
        }
    },
    
    renderTab(tab) {
        this.state.currentTab = tab;
        
        // Update nav active state
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.tab === tab);
        });
        
        // Update page title
        const titles = {
            orders: 'Orders & Inquiries',
            products: 'Products Management',
            articles: 'Articles Management',
            banners: 'Banners Management',
            content: 'Page Content',
            settings: 'Site Settings'
        };
        document.getElementById('admin-page-title').textContent = titles[tab] || tab;
        
        // Render tab content
        const contentArea = document.getElementById('admin-content-area');
        switch (tab) {
            case 'orders':
                this.renderOrdersTab(contentArea);
                break;
            case 'products':
                this.renderProductsTab(contentArea);
                break;
            case 'articles':
                this.renderArticlesTab(contentArea);
                break;
            case 'banners':
                this.renderBannersTab(contentArea);
                break;
            case 'content':
                this.renderContentTab(contentArea);
                break;
            case 'settings':
                this.renderSettingsTab(contentArea);
                break;
        }
    },
    
    // ============================================
    // DATA LOADING
    // ============================================
    
    async loadOrders() {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            
            if (error) throw error;
            this.state.orders = data;
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    },
    
    async loadProducts() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            this.state.products = data;
        } catch (error) {
            console.error('Error loading products:', error);
        }
    },
    
    async loadBanners() {
        try {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .order('display_order');
            
            if (error) throw error;
            this.state.banners = data;
        } catch (error) {
            console.error('Error loading banners:', error);
        }
    },
    
    async loadSettings() {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .single();
            
            if (error) throw error;
            this.state.settings = data;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    },
    
    async loadPageContents() {
        try {
            const { data, error } = await supabase
                .from('page_contents')
                .select('*');
            
            if (error) throw error;
            this.state.pageContents = data;
        } catch (error) {
            console.error('Error loading page contents:', error);
        }
    },
    
    // ============================================
    // TAB RENDERERS
    // ============================================
    
    renderOrdersTab(container) {
        const { orders } = this.state;
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <p>No orders yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Company</th>
                        <th>Email</th>
                        <th>Items</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td><strong>${sanitizeHTML(order.order_number)}</strong></td>
                            <td>${sanitizeHTML(order.customer_name)}</td>
                            <td>${sanitizeHTML(order.customer_company || '-')}</td>
                            <td><a href="mailto:${sanitizeHTML(order.customer_email)}">${sanitizeHTML(order.customer_email)}</a></td>
                            <td>${order.total_items} items</td>
                            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                            <td>${formatRelativeTime(order.created_at)}</td>
                            <td class="admin-actions">
                                <button class="btn-edit" onclick="Admin.viewOrder('${order.id}')">View</button>
                                <select onchange="Admin.updateOrderStatus('${order.id}', this.value)" style="padding: 0.25rem; border-radius: 4px;">
                                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    viewOrder(orderId) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order) return;
        
        const itemsHtml = order.items.map(item => 
            `<p>• ${sanitizeHTML(item.name)} x ${item.quantity}</p>`
        ).join('');
        
        alert(`Order #${order.order_number}\n\nCustomer: ${order.customer_name}\nEmail: ${order.customer_email}\nPhone: ${order.phone || '-'}\n\nItems:\n${itemsHtml}\n\nNotes: ${order.notes || '-'}`);
    },
    
    async updateOrderStatus(orderId, status) {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);
            
            if (error) throw error;
            
            const order = this.state.orders.find(o => o.id === orderId);
            if (order) order.status = status;
            
            window.Utils.Toast.success('Order status updated');
        } catch (error) {
            window.Utils.Toast.error('Failed to update status');
        }
    },
    
    renderProductsTab(container) {
        container.innerHTML = `
            <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <h3>Products (${this.state.products.length})</h3>
                <button class="btn btn-primary" onclick="Admin.showProductForm()">+ Add Product</button>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>MOQ</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.state.products.map(product => `
                        <tr>
                            <td><img src="${product.image_url || ''}" alt="" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                            <td>${sanitizeHTML(product.name)}</td>
                            <td>${sanitizeHTML(product.category)}</td>
                            <td>${product.moq}</td>
                            <td>${product.is_active ? '✅ Active' : '❌ Inactive'}</td>
                            <td class="admin-actions">
                                <button class="btn-edit" onclick="Admin.editProduct('${product.id}')">Edit</button>
                                <button class="btn-delete" onclick="Admin.deleteProduct('${product.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    showProductForm(product = null) {
        // Simplified product form - in production, use a modal with full form
        const name = prompt('Product Name:', product?.name || '');
        if (!name) return;
        
        const category = prompt('Category (coffee/spices/natural):', product?.category || 'coffee');
        const moq = prompt('MOQ:', product?.moq || '100');
        const description = prompt('Description:', product?.description || '');
        const imageUrl = prompt('Image URL:', product?.image_url || '');
        
        if (product) {
            this.updateProduct(product.id, { name, category, moq: parseInt(moq), description, image_url: imageUrl });
        } else {
            this.createProduct({ name, category, moq: parseInt(moq), description, image_url: imageUrl });
        }
    },
    
    async createProduct(data) {
        try {
            const slug = generateSlug(data.name);
            const { error } = await window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY).from('products').insert({
                ...data,
                slug,
                specifications: {}
            });
            
            if (error) throw error;
            
            window.Utils.Toast.success('Product created');
            await this.loadProducts();
            this.renderProductsTab(document.getElementById('admin-content-area'));
            App.refreshProducts();
        } catch (error) {
            window.Utils.Toast.error('Failed to create product');
        }
    },
    
    async updateProduct(id, data) {
        try {
            const { error } = await window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY).from('products').update(data).eq('id', id);
            
            if (error) throw error;
            
            window.Utils.Toast.success('Product updated');
            await this.loadProducts();
            this.renderProductsTab(document.getElementById('admin-content-area'));
            App.refreshProducts();
        } catch (error) {
            window.Utils.Toast.error('Failed to update product');
        }
    },
    
    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const { error } = await window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY).from('products').delete().eq('id', id);
            
            if (error) throw error;
            
            window.Utils.Toast.success('Product deleted');
            await this.loadProducts();
            this.renderProductsTab(document.getElementById('admin-content-area'));
            App.refreshProducts();
        } catch (error) {
            window.Utils.Toast.error('Failed to delete product');
        }
    },
    
    editProduct(id) {
        const product = this.state.products.find(p => p.id === id);
        if (product) this.showProductForm(product);
    },
    
    renderArticlesTab(container) {
        container.innerHTML = `
            <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <h3>Articles</h3>
                <button class="btn btn-primary" onclick="Admin.showArticleForm()">+ Add Article</button>
            </div>
            <p style="color: var(--gray);">Article management coming soon...</p>
        `;
    },
    
    showArticleForm() {
        alert('Article form coming soon. Use Supabase dashboard for now.');
    },
    
    renderBannersTab(container) {
        const { banners } = this.state;
        
        container.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <h3>Banners</h3>
            </div>
            ${banners.map(banner => `
                <div style="background: white; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; box-shadow: var(--shadow);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${sanitizeHTML(banner.section)}</strong>
                            <p>${sanitizeHTML(banner.title || '')}</p>
                        </div>
                        <label>
                            <input type="checkbox" ${banner.is_active ? 'checked' : ''} onchange="Admin.toggleBanner('${banner.id}', this.checked)">
                            Active
                        </label>
                    </div>
                </div>
            `).join('')}
        `;
    },
    
    async toggleBanner(id, isActive) {
        try {
            const { error } = await window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY).from('banners').update({ is_active: isActive }).eq('id', id);
            
            if (error) throw error;
            
            window.Utils.Toast.success('Banner updated');
            window.Utils.Storage.remove('banners');
        } catch (error) {
            window.Utils.Toast.error('Failed to update banner');
        }
    },
    
    renderContentTab(container) {
        container.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <h3>Page Contents</h3>
            </div>
            <div style="background: white; padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
                <p><strong>About Page:</strong> Edit in Supabase dashboard or contact developer</p>
            </div>
            <div style="background: white; padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
                <p><strong>Contact Page:</strong> Edit in Supabase dashboard or contact developer</p>
            </div>
        `;
    },
    
    renderSettingsTab(container) {
        const { settings } = this.state;
        if (!settings) return;
        
        container.innerHTML = `
            <form class="admin-form" onsubmit="Admin.saveSettings(event)">
                <div class="form-group">
                    <label>Company Name</label>
                    <input type="text" name="company_name" value="${sanitizeHTML(settings.company_name || '')}" required>
                </div>
                <div class="form-group">
                    <label>Default Email</label>
                    <input type="email" name="default_email" value="${sanitizeHTML(settings.default_email || '')}" required>
                </div>
                <div class="form-group">
                    <label>WhatsApp Number</label>
                    <input type="text" name="default_wa" value="${sanitizeHTML(settings.default_wa || '')}">
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <textarea name="address" rows="3">${sanitizeHTML(settings.address || '')}</textarea>
                </div>
                <button type="submit" class="btn btn-primary">Save Settings</button>
            </form>
        `;
    },
    
    async saveSettings(e) {
        e.preventDefault();
        const form = e.target;
        
        const data = {
            company_name: form.company_name.value,
            default_email: form.default_email.value,
            default_wa: form.default_wa.value,
            address: form.address.value
        };
        
        try {
            const { error } = await window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY).from('settings').update(data).eq('id', this.state.settings.id);
            
            if (error) throw error;
            
            window.Utils.Toast.success('Settings saved');
            window.Utils.Storage.remove('settings');
            App.loadSettings();
        } catch (error) {
            window.Utils.Toast.error('Failed to save settings');
        }
    }
};

// Export for use in other modules
window.Admin = Admin;
