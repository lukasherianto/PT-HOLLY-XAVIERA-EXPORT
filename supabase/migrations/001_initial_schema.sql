-- PT. Holly Xaviera Export - Initial Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    moq INTEGER NOT NULL DEFAULT 100,
    description TEXT,
    specifications JSONB DEFAULT '{}',
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);

-- ============================================
-- ARTICLES TABLE
-- ============================================
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
CREATE INDEX idx_articles_published ON articles(is_published);

-- ============================================
-- ORDERS/INQUIRIES TABLE
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_company VARCHAR(255),
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_address TEXT NOT NULL,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    total_items INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================
-- BANNERS TABLE
-- ============================================
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
CREATE INDEX idx_banners_active ON banners(is_active);

-- ============================================
-- PAGE_CONTENTS TABLE
-- ============================================
CREATE TABLE page_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_key VARCHAR(100) UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_contents_key ON page_contents(page_key);

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) DEFAULT 'PT. Holly Xaviera Export',
    default_email VARCHAR(255),
    default_wa VARCHAR(50),
    address TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    social_media JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMIN USERS (extends Supabase Auth)
-- ============================================
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE INDEX idx_admin_profiles_email ON admin_profiles(email);

-- ============================================
-- STORAGE BUCKETS SETUP
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('product-images', 'product-images', true),
    ('banner-images', 'banner-images', true),
    ('article-images', 'article-images', true),
    ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRODUCTS RLS POLICIES
-- ============================================
-- Public can read active products
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage products" ON products
    FOR ALL 
    USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')))
    WITH CHECK (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')));

-- ============================================
-- ARTICLES RLS POLICIES
-- ============================================
-- Public can read published articles
CREATE POLICY "Public can view published articles" ON articles
    FOR SELECT USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage articles" ON articles
    FOR ALL 
    USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')))
    WITH CHECK (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')));

-- ============================================
-- ORDERS RLS POLICIES
-- ============================================
-- No public access to orders
CREATE POLICY "No public access to orders" ON orders
    FOR SELECT USING (false);

-- Admins can view and update orders
CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL 
    USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')))
    WITH CHECK (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')));

-- Edge function can insert orders (using service role)
-- This is handled by the service role key, not RLS

-- ============================================
-- BANNERS RLS POLICIES
-- ============================================
-- Public can read active banners
CREATE POLICY "Public can view active banners" ON banners
    FOR SELECT USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage banners" ON banners
    FOR ALL 
    USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')))
    WITH CHECK (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')));

-- ============================================
-- PAGE_CONTENTS RLS POLICIES
-- ============================================
-- Public can read page contents
CREATE POLICY "Public can view page contents" ON page_contents
    FOR SELECT USING (true);

-- Admins can update page contents
CREATE POLICY "Admins can manage page contents" ON page_contents
    FOR ALL 
    USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')))
    WITH CHECK (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')));

-- ============================================
-- SETTINGS RLS POLICIES
-- ============================================
-- Public can read settings
CREATE POLICY "Public can view settings" ON settings
    FOR SELECT USING (true);

-- Admins can update settings
CREATE POLICY "Admins can manage settings" ON settings
    FOR ALL 
    USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')))
    WITH CHECK (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')));

-- ============================================
-- ADMIN_PROFILES RLS POLICIES
-- ============================================
-- Only admins can view admin profiles
CREATE POLICY "Admins can view admin profiles" ON admin_profiles
    FOR SELECT 
    USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin')));

-- ============================================
-- STORAGE BUCKET POLICIES
-- ============================================

-- Product Images - Public read, Admin write
CREATE POLICY "Public can read product images" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'product-images' 
        AND auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin'))
    );

CREATE POLICY "Admins can delete product images" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'product-images' 
        AND auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin'))
    );

-- Banner Images - Public read, Admin write
CREATE POLICY "Public can read banner images" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'banner-images');

CREATE POLICY "Admins can upload banner images" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'banner-images' 
        AND auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin'))
    );

CREATE POLICY "Admins can delete banner images" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'banner-images' 
        AND auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin'))
    );

-- Article Images - Public read, Admin write
CREATE POLICY "Public can read article images" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'article-images');

CREATE POLICY "Admins can upload article images" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'article-images' 
        AND auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin'))
    );

CREATE POLICY "Admins can delete article images" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'article-images' 
        AND auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin'))
    );

-- Company Assets - Public read, Admin write
CREATE POLICY "Public can read company assets" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'company-assets');

CREATE POLICY "Admins can upload company assets" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'company-assets' 
        AND auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('admin', 'super_admin'))
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
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

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'HX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_before_insert BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================
-- SEED DATA
-- ============================================

-- Default settings
INSERT INTO settings (company_name, default_email, default_wa, address, social_media) VALUES
    ('PT. Holly Xaviera Export', 'info@hollyxaviera.com', '+6281234567890', 
     'Jl. Export No. 123, Jakarta, Indonesia', 
     '{"facebook": "", "instagram": "", "linkedin": ""}'::jsonb)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Default hero banner
INSERT INTO banners (section, title, subtitle, cta_text, cta_link, is_active, display_order) VALUES
    ('hero', 'Premium Indonesian Commodities', 'Your trusted partner for coffee, spices, and natural products',
     'Explore Products', '#products', true, 1)
ON CONFLICT (section) DO UPDATE SET updated_at = NOW();

-- Default page contents
INSERT INTO page_contents (page_key, content) VALUES
    ('about', '{"title": "About Us", "content": "<p>PT. Holly Xaviera Export is a leading Indonesian exporter...</p>"}'::jsonb),
    ('contact', '{"title": "Contact Us", "email": "info@hollyxaviera.com", "phone": "+6281234567890", "address": "Jakarta, Indonesia"}'::jsonb),
    ('footer', '{"copyright": "© 2024 PT. Holly Xaviera Export. All rights reserved."}'::jsonb)
ON CONFLICT (page_key) DO UPDATE SET updated_at = NOW();

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Schema created successfully!';
    RAISE NOTICE '📦 Tables: products, articles, orders, banners, page_contents, settings, admin_profiles';
    RAISE NOTICE '🔐 RLS policies enabled for all tables';
    RAISE NOTICE '🗂️ Storage buckets created: product-images, banner-images, article-images, company-assets';
    RAISE NOTICE '⚡ Triggers configured for updated_at and order_number generation';
END $$;
