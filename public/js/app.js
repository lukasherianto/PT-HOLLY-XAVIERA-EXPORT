/**
 * PT. Holly Xaviera Export - Main Application
 * Handles page initialization, routing, and data loading
 */

const App = {
    state: {
        products: [],
        articles: [],
        settings: null,
        banners: null,
        pageContents: null
    },
    
    async init() {
        try {
            // Load all initial data in parallel
            await Promise.all([
                this.loadSettings(),
                this.loadBanners(),
                this.loadProducts(),
                this.loadPageContents()
            ]);
            
            // Initialize components
            Cart.init();
            this.bindEvents();
            this.initLazyLoad();
            this.handleHashNavigation();
            
            // Hide loading screen
            this.hideLoading();
            
            // Setup admin if hash is #admin
            if (window.location.hash === '#admin' || window.location.hash === '#admin/') {
                Admin.init();
            }
            
        } catch (error) {
            console.error('App initialization error:', error);
            Toast.error('Failed to load application data');
            this.hideLoading();
        }
    },
    
    hideLoading() {
        const loadingEl = document.getElementById('app-loading');
        if (loadingEl) {
            loadingEl.style.opacity = '0';
            loadingEl.style.transition = 'opacity 0.3s ease';
            setTimeout(() => loadingEl.remove(), 300);
        }
    },
    
    // ============================================
    // DATA LOADING
    // ============================================
    
    async loadSettings() {
        try {
            // Check cache first
            const cached = Storage.get('settings');
            if (cached) {
                this.state.settings = cached;
                this.renderSettings(cached);
                return;
            }
            
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .single();
            
            if (error) throw error;
            
            this.state.settings = data;
            Storage.set('settings', data);
            this.renderSettings(data);
            
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    },
    
    renderSettings(settings) {
        // Update footer
        const addressEl = document.getElementById('footer-address');
        if (addressEl && settings.address) {
            addressEl.textContent = settings.address;
        }
        
        // Update copyright
        const copyrightEl = document.getElementById('footer-copyright');
        if (copyrightEl) {
            copyrightEl.textContent = `© ${new Date().getFullYear()} ${settings.company_name || 'PT. Holly Xaviera Export'}. All rights reserved.`;
        }
        
        // Update social links
        if (settings.social_media) {
            if (settings.social_media.facebook) {
                const fbLink = document.querySelector('.social-link[aria-label="Facebook"]');
                if (fbLink) fbLink.href = settings.social_media.facebook;
            }
            if (settings.social_media.instagram) {
                const igLink = document.querySelector('.social-link[aria-label="Instagram"]');
                if (igLink) igLink.href = settings.social_media.instagram;
            }
            if (settings.social_media.linkedin) {
                const liLink = document.querySelector('.social-link[aria-label="LinkedIn"]');
                if (liLink) liLink.href = settings.social_media.linkedin;
            }
        }
    },
    
    async loadBanners() {
        try {
            const cached = Storage.get('banners');
            if (cached) {
                this.state.banners = cached;
                this.renderBanners(cached);
                return;
            }
            
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            
            if (error) throw error;
            
            this.state.banners = data;
            Storage.set('banners', data);
            this.renderBanners(data);
            
        } catch (error) {
            console.error('Error loading banners:', error);
        }
    },
    
    renderBanners(banners) {
        const heroBanner = banners.find(b => b.section === 'hero');
        if (heroBanner) {
            const heroSection = document.getElementById('home');
            const titleEl = document.querySelector('.hero-title');
            const subtitleEl = document.querySelector('.hero-subtitle');
            
            if (heroBanner.title && titleEl) {
                titleEl.textContent = heroBanner.title;
            }
            if (heroBanner.subtitle && subtitleEl) {
                subtitleEl.textContent = heroBanner.subtitle;
            }
            if (heroBanner.image_url && heroSection) {
                heroSection.style.backgroundImage = `url(${heroBanner.image_url})`;
            }
        }
    },
    
    async loadProducts() {
        try {
            const cached = Storage.get('products');
            if (cached) {
                this.state.products = cached;
                this.renderProducts(cached);
                return;
            }
            
            const { data, error } = await supabase
                .from('products')
                .select('id, name, slug, category, moq, description, image_url, is_active')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.state.products = data;
            Storage.set('products', data, 10 * 60 * 1000); // 10 min cache
            this.renderProducts(data);
            
        } catch (error) {
            console.error('Error loading products:', error);
            const grid = document.getElementById('products-grid');
            if (grid) {
                grid.innerHTML = '<div class="empty-state"><p>Failed to load products. Please refresh the page.</p></div>';
            }
        }
    },
    
    renderProducts(products, filter = '') {
        const grid = document.getElementById('products-grid');
        if (!grid) return;
        
        let filtered = products;
        
        // Apply search filter
        if (filter) {
            const searchTerm = filter.toLowerCase();
            filtered = products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">🔍</div>
                    <p>No products found</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = filtered.map(product => `
            <article class="product-card" data-category="${sanitizeHTML(product.category)}">
                <img 
                    src="${product.image_url || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22 viewBox=%220 0 400 200%22%3E%3Crect fill=%22%23e9ecef%22 width=%22400%22 height=%22200%22/%3E%3Ctext fill=%22%236c757d%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22%3ENo Image Available%3C/text%3E%3C/svg%3E'}"
                    alt="${sanitizeHTML(product.name)}"
                    class="product-image"
                    loading="lazy"
                    ${!product.image_url ? '' : 'data-src="' + product.image_url + '"'}
                >
                <div class="product-info">
                    <span class="product-category">${sanitizeHTML(product.category)}</span>
                    <h3 class="product-name">${sanitizeHTML(product.name)}</h3>
                    <p class="product-description">${sanitizeHTML(product.description || '')}</p>
                    <p class="product-moq">MOQ: ${product.moq} units</p>
                    <div class="product-actions">
                        <button type="button" class="btn btn-primary add-to-cart-btn" data-product='${JSON.stringify(product).replace(/'/g, "&#39;")}'>
                            Add to Inquiry
                        </button>
                    </div>
                </div>
            </article>
        `).join('');
        
        // Bind add to cart buttons
        grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    const product = JSON.parse(btn.dataset.product.replace(/&#39;/g, "'"));
                    Cart.add(product);
                } catch (e) {
                    console.error('Error parsing product data:', e);
                }
            });
        });
        
        // Reinitialize lazy loading
        this.initLazyLoad();
    },
    
    async loadPageContents() {
        try {
            const cached = Storage.get('pageContents');
            if (cached) {
                this.state.pageContents = cached;
                this.renderPageContents(cached);
                return;
            }
            
            const { data, error } = await supabase
                .from('page_contents')
                .select('*');
            
            if (error) throw error;
            
            this.state.pageContents = data;
            Storage.set('pageContents', data);
            this.renderPageContents(data);
            
        } catch (error) {
            console.error('Error loading page contents:', error);
        }
    },
    
    renderPageContents(contents) {
        const aboutContent = contents.find(c => c.page_key === 'about');
        const contactContent = contents.find(c => c.page_key === 'contact');
        const footerContent = contents.find(c => c.page_key === 'footer');
        
        // Render About section
        const aboutEl = document.getElementById('about-content');
        if (aboutEl && aboutContent?.content) {
            aboutEl.innerHTML = `
                <div>${aboutContent.content.content || ''}</div>
            `;
        }
        
        // Render Contact section
        const contactEl = document.getElementById('contact-content');
        if (contactEl && contactContent?.content) {
            const content = contactContent.content;
            contactEl.innerHTML = `
                <div>${content.content || `<p>Contact us for inquiries about our products and services.</p>`}</div>
                <div class="contact-info">
                    ${content.email ? `
                        <div class="contact-item">
                            <div class="contact-icon">✉️</div>
                            <div>
                                <strong>Email</strong><br>
                                <a href="mailto:${sanitizeHTML(content.email)}">${sanitizeHTML(content.email)}</a>
                            </div>
                        </div>
                    ` : ''}
                    ${content.phone ? `
                        <div class="contact-item">
                            <div class="contact-icon">📱</div>
                            <div>
                                <strong>WhatsApp</strong><br>
                                <a href="https://wa.me/${sanitizeHTML(content.phone.replace(/\D/g, ''))}" rel="noopener noreferrer" target="_blank">${sanitizeHTML(content.phone)}</a>
                            </div>
                        </div>
                    ` : ''}
                    ${content.address ? `
                        <div class="contact-item">
                            <div class="contact-icon">📍</div>
                            <div>
                                <strong>Address</strong><br>
                                ${sanitizeHTML(content.address)}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    },
    
    async loadArticles() {
        try {
            const cached = Storage.get('articles');
            if (cached) {
                this.state.articles = cached;
                this.renderArticles(cached);
                return;
            }
            
            const { data, error } = await supabase
                .from('articles')
                .select('id, title, slug, content, featured_image, published_at')
                .eq('is_published', true)
                .order('published_at', { ascending: false })
                .limit(6);
            
            if (error) throw error;
            
            this.state.articles = data;
            Storage.set('articles', data);
            this.renderArticles(data);
            
        } catch (error) {
            console.error('Error loading articles:', error);
        }
    },
    
    renderArticles(articles) {
        const grid = document.getElementById('articles-grid');
        if (!grid) return;
        
        if (articles.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">📝</div>
                    <p>No articles yet</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = articles.map(article => {
            const excerpt = article.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...';
            return `
                <article class="article-card">
                    <img 
                        src="${article.featured_image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22180%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%23e9ecef%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%236c757d%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22%3ENo Image%3C/text%3E%3C/svg%3E'}"
                        alt="${sanitizeHTML(article.title)}"
                        class="article-image"
                        loading="lazy"
                    >
                    <div class="article-content">
                        <h3 class="article-title">${sanitizeHTML(article.title)}</h3>
                        <p class="article-excerpt">${sanitizeHTML(excerpt)}</p>
                        <p class="article-date">${formatDate(article.published_at || article.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </article>
            `;
        }).join('');
    },
    
    // ============================================
    // EVENT HANDLING
    // ============================================
    
    bindEvents() {
        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
                navMenu.classList.toggle('active');
            });
            
            // Close menu on link click
            navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navMenu.classList.remove('active');
                });
            });
        }
        
        // Product search with debounce
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.renderProducts(this.state.products, e.target.value);
            }, 300));
        }
        
        // Category filter
        const filterSelect = document.querySelector('.filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                const category = e.target.value;
                let filtered = this.state.products;
                
                if (category) {
                    filtered = this.state.products.filter(p => p.category.toLowerCase() === category.toLowerCase());
                }
                
                this.renderProducts(filtered, searchInput?.value || '');
            });
        }
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId !== '#' && targetId !== '#admin') {
                    const target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
        
        // Handle hash changes
        window.addEventListener('hashchange', () => this.handleHashNavigation());
    },
    
    handleHashNavigation() {
        const hash = window.location.hash;
        
        // Handle admin route
        if (hash === '#admin' || hash.startsWith('#admin/')) {
            if (!window.Admin) {
                // Admin module not loaded, trigger event
                document.dispatchEvent(new CustomEvent('admin:init'));
            } else {
                Admin.init();
            }
        }
    },
    
    initLazyLoad() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '50px' });
            
            images.forEach(img => imageObserver.observe(img));
        }
    },
    
    // Public method to refresh products (used by admin)
    refreshProducts() {
        Storage.remove('products');
        this.loadProducts();
    },
    
    // Public method to refresh articles (used by admin)
    refreshArticles() {
        Storage.remove('articles');
        this.loadArticles();
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Export for use in other modules
window.App = App;
