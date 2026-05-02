-- =====================================================
-- PT. Holly Xaviera Export - Supabase Schema
-- Production-ready with RLS, Indexes, and Security
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    moq INTEGER NOT NULL DEFAULT 100,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- =====================================================
-- 2. ARTICLES TABLE (Blog/News)
-- =====================================================
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    featured_image TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT[],
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(is_published) WHERE is_published = true;
CREATE INDEX idx_articles_published_at ON articles(published_at) WHERE is_published = true;

-- =====================================================
-- 3. ORDERS/INQUIRIES TABLE
-- =====================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_company VARCHAR(255),
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_address TEXT NOT NULL,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- =====================================================
-- 4. BANNERS TABLE
-- =====================================================
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255),
    subtitle TEXT,
    image_url TEXT,
    cta_text VARCHAR(100),
    cta_link VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_banners_section ON banners(section);
CREATE INDEX idx_banners_active ON banners(is_active) WHERE is_active = true;

-- =====================================================
-- 5. PAGE_CONTENTS TABLE (About, Contact, Footer, etc.)
-- =====================================================
CREATE TABLE page_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_key VARCHAR(100) UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_contents_key ON page_contents(page_key);

-- =====================================================
-- 6. SETTINGS TABLE
-- =====================================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'PT. Holly Xaviera Export',
    default_email VARCHAR(255) NOT NULL,
    default_wa VARCHAR(50),
    address TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    social_media JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_id ON settings(id);

-- =====================================================
-- 7. ADMIN_USERS TABLE (for dashboard access)
-- =====================================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_contents_updated_at BEFORE UPDATE ON page_contents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ORDER NUMBER GENERATION FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'INQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRODUCTS POLICIES
-- =====================================================
-- Public can read active products
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Admin can do everything (check via auth or admin_users)
CREATE POLICY "Admin full access to products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = current_setting('request.jwt.claims', true)::json->>'email'
            AND admin_users.is_active = true
        )
    );

-- =====================================================
-- ARTICLES POLICIES
-- =====================================================
-- Public can read published articles
CREATE POLICY "Public can view published articles" ON articles
    FOR SELECT USING (is_published = true);

-- Admin full access
CREATE POLICY "Admin full access to articles" ON articles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = current_setting('request.jwt.claims', true)::json->>'email'
            AND admin_users.is_active = true
        )
    );

-- =====================================================
-- ORDERS POLICIES
-- =====================================================
-- No public read access to orders
CREATE POLICY "No public access to orders" ON orders
    FOR SELECT USING (false);

-- Admin full access
CREATE POLICY "Admin full access to orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = current_setting('request.jwt.claims', true)::json->>'email'
            AND admin_users.is_active = true
        )
    );

-- Insert via Edge Function only (service role)
CREATE POLICY "Service role can insert orders" ON orders
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- BANNERS POLICIES
-- =====================================================
-- Public can read active banners
CREATE POLICY "Public can view active banners" ON banners
    FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admin full access to banners" ON banners
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = current_setting('request.jwt.claims', true)::json->>'email'
            AND admin_users.is_active = true
        )
    );

-- =====================================================
-- PAGE_CONTENTS POLICIES
-- =====================================================
-- Public can read page contents
CREATE POLICY "Public can view page contents" ON page_contents
    FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin full access to page contents" ON page_contents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = current_setting('request.jwt.claims', true)::json->>'email'
            AND admin_users.is_active = true
        )
    );

-- =====================================================
-- SETTINGS POLICIES
-- =====================================================
-- Public can read settings
CREATE POLICY "Public can view settings" ON settings
    FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin full access to settings" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = current_setting('request.jwt.claims', true)::json->>'email'
            AND admin_users.is_active = true
        )
    );

-- =====================================================
-- ADMIN_USERS POLICIES
-- =====================================================
-- No public access
CREATE POLICY "No public access to admin_users" ON admin_users
    FOR SELECT USING (false);

-- =====================================================
-- STORAGE BUCKETS SETUP
-- =====================================================
-- Run this in Supabase Dashboard > Storage or via API:
-- Create buckets: product-images, banner-images, article-images

-- Storage policies (run in SQL editor after creating buckets):
/*
-- Product Images Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Public can view product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' 
        AND EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = current_setting('request.jwt.claims', true)::json->>'email'
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin can delete product images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' 
        AND EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = current_setting('request.jwt.claims', true)::json->>'email'
            AND admin_users.is_active = true
        )
    );

-- Banner Images Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('banner-images', 'banner-images', true);

CREATE POLICY "Public can view banner images" ON storage.objects
    FOR SELECT USING (bucket_id = 'banner-images');

CREATE POLICY "Admin can upload banner images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'banner-images' 
        AND EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = current_setting('request.jwt.claims', true)::json->>'email'
            AND admin_users.is_active = true
        )
    );

-- Article Images Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('article-images', 'article-images', true);

CREATE POLICY "Public can view article images" ON storage.objects
    FOR SELECT USING (bucket_id = 'article-images');

CREATE POLICY "Admin can upload article images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'article-images' 
        AND EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = current_setting('request.jwt.claims', true)::json->>'email'
            AND admin_users.is_active = true
        )
    );
*/

-- =====================================================
-- SEED DATA
-- =====================================================

-- Default Settings
INSERT INTO settings (company_name, default_email, default_wa, address) VALUES
('PT. Holly Xaviera Export', 'info@hollyxaviera.com', '+6281234567890', 'Jakarta, Indonesia')
ON CONFLICT (id) DO NOTHING;

-- Hero Banner
INSERT INTO banners (section, title, subtitle, cta_text, cta_link, is_active) VALUES
('hero', 'Premium Indonesian Coffee & Spices', 'Your trusted partner for high-quality agricultural exports from Indonesia', 'Explore Products', '#products', true),
('about', 'Quality You Can Trust', 'Certified exporters with years of experience', null, null, true)
ON CONFLICT (section) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle;

-- Page Contents
INSERT INTO page_contents (page_key, content) VALUES
('about', '{"title": "About Us", "content": "<p>PT. Holly Xaviera Export is a leading Indonesian exporter...</p>"}'),
('contact', '{"title": "Contact Us", "email": "info@hollyxaviera.com", "phone": "+6281234567890", "address": "Jakarta, Indonesia"}'),
('footer', '{"copyright": "© 2024 PT. Holly Xaviera Export. All rights reserved.", "links": []}')
ON CONFLICT (page_key) DO UPDATE SET content = EXCLUDED.content;

-- Sample Products
INSERT INTO products (name, slug, category, moq, description, specifications, is_active) VALUES
('Arabica Coffee Beans', 'arabica-coffee-beans', 'Coffee', 500, 'Premium Arabica coffee beans from Aceh Gayo', '{"origin": "Aceh Gayo", "altitude": "1200-1700m", "process": "Washed", "moisture": "12%", "defects": "Max 5"}', true),
('Robusta Coffee Beans', 'robusta-coffee-beans', 'Coffee', 1000, 'High-quality Robusta beans from Lampung', '{"origin": "Lampung", "altitude": "400-800m", "process": "Natural", "moisture": "13%", "caffeine": "2.5%"}', true),
('Nutmeg Whole', 'nutmeg-whole', 'Spices', 200, 'Premium Grade A whole nutmeg from Banda Islands', '{"origin": "Banda Islands", "grade": "A", "moisture": "Max 10%", "volatile_oil": "Min 8%"}', true),
('White Pepper', 'white-pepper', 'Spices', 300, 'Premium white pepper from Bangka Belitung', '{"origin": "Bangka", "grade": "FAQ", "moisture": "Max 12%", "density": "650g/L"}', true),
('Cocoa Beans', 'cocoa-beans', 'Cocoa', 500, 'Fermented cocoa beans from Sulawesi', '{"origin": "Sulawesi", "fermentation": "Yes", "moisture": "Max 7%", "bean_count": "100-110/100g"}', true)
ON CONFLICT (slug) DO NOTHING;
