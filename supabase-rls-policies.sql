-- ==========================================================================
-- Supabase Row Level Security (RLS) Policies
-- PT. Holly Xaviera Export - Production Database Security
-- ==========================================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ==========================================================================
-- PRODUCTS TABLE
-- Public read access, admin write access only
-- ==========================================================================

-- Policy: Anyone can view published products
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT 
USING (status = 'published');

-- Policy: Only authenticated admins can insert products
CREATE POLICY "Only admins can insert products" 
ON products FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Policy: Only authenticated admins can update products
CREATE POLICY "Only admins can update products" 
ON products FOR UPDATE 
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Policy: Only authenticated admins can delete products
CREATE POLICY "Only admins can delete products" 
ON products FOR DELETE 
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- ==========================================================================
-- ARTICLES TABLE (Blog Posts)
-- Public read access for published, admin write access
-- ==========================================================================

-- Policy: Anyone can view published articles
CREATE POLICY "Published articles are viewable by everyone" 
ON articles FOR SELECT 
USING (
    status = 'published' AND 
    published_at <= NOW()
);

-- Policy: Authenticated users can view draft articles they authored
CREATE POLICY "Authors can view their drafts" 
ON articles FOR SELECT 
USING (
    auth.role() = 'authenticated' AND 
    author_id = auth.uid()
);

-- Policy: Only authenticated admins/authors can insert articles
CREATE POLICY "Authenticated users can insert articles" 
ON articles FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' AND 
    author_id = auth.uid()
);

-- Policy: Authors can update their own articles
CREATE POLICY "Authors can update their articles" 
ON articles FOR UPDATE 
USING (
    auth.role() = 'authenticated' AND 
    (author_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    ))
);

-- Policy: Only admins can delete articles
CREATE POLICY "Only admins can delete articles" 
ON articles FOR DELETE 
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- ==========================================================================
-- SETTINGS TABLE
-- Read-only for public, admin write access only
-- ==========================================================================

-- Policy: Anyone can view public settings
CREATE POLICY "Public settings are viewable by everyone" 
ON settings FOR SELECT 
USING (is_public = true);

-- Policy: Only authenticated admins can view private settings
CREATE POLICY "Private settings visible to admins only" 
ON settings FOR SELECT 
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Policy: Only authenticated admins can insert settings
CREATE POLICY "Only admins can insert settings" 
ON settings FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Policy: Only authenticated admins can update settings
CREATE POLICY "Only admins can update settings" 
ON settings FOR UPDATE 
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Policy: Only authenticated admins can delete settings
CREATE POLICY "Only admins can delete settings" 
ON settings FOR DELETE 
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- ==========================================================================
-- INQUIRIES TABLE (Contact Form Submissions)
-- No public access, admin read/write only
-- ==========================================================================

-- Policy: No public select access
CREATE POLICY "No public access to inquiries" 
ON inquiries FOR SELECT 
USING (false);

-- Policy: Anyone can submit inquiries (anonymous)
CREATE POLICY "Anyone can submit inquiries" 
ON inquiries FOR INSERT 
WITH CHECK (true);

-- Policy: Only authenticated admins can view inquiries
CREATE POLICY "Only admins can view inquiries" 
ON inquiries FOR SELECT 
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Policy: Only authenticated admins can update inquiries
CREATE POLICY "Only admins can update inquiries" 
ON inquiries FOR UPDATE 
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Policy: Only authenticated admins can delete inquiries
CREATE POLICY "Only admins can delete inquiries" 
ON inquiries FOR DELETE 
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- ==========================================================================
-- USERS TABLE
-- Users can view their own profile, admins can view all
-- ==========================================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (
    auth.role() = 'authenticated' AND 
    id = auth.uid()
);

-- Policy: Admins can view all user profiles
CREATE POLICY "Admins can view all profiles" 
ON users FOR SELECT 
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (
    auth.role() = 'authenticated' AND 
    id = auth.uid()
);

-- Policy: Admins can update any user profile
CREATE POLICY "Admins can update any profile" 
ON users FOR UPDATE 
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- ==========================================================================
-- ADDITIONAL SECURITY: Functions for Admin Check
-- ==========================================================================

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ==========================================================================
-- DATABASE TRIGGERS FOR DATA INTEGRITY
-- ==========================================================================

-- Trigger to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to products table
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to articles table
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================================
-- INDEXES FOR PERFORMANCE
-- ==========================================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Articles indexes
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);

-- Inquiries indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ==========================================================================
-- SAMPLE DATA SEED (Optional - Remove in production)
-- ==========================================================================

-- Insert default admin user (change password in production!)
-- INSERT INTO users (id, email, role, created_at)
-- VALUES (auth.uid(), 'admin@hollyxavieraexport.com', 'admin', NOW());

-- Insert sample products
-- INSERT INTO products (name, description, category, origin, status, image_url)
-- VALUES 
--     ('Arabica Coffee', 'Premium Indonesian Arabica coffee beans from Aceh Gayo region', 'Coffee', 'Aceh, Indonesia', 'published', '/images/products/arabica.jpg'),
--     ('Robusta Coffee', 'High-quality Robusta coffee with bold flavor', 'Coffee', 'Lampung, Indonesia', 'published', '/images/products/robusta.jpg'),
--     ('Cloves', 'Premium quality dried cloves from Maluku', 'Spices', 'Maluku, Indonesia', 'published', '/images/products/cloves.jpg'),
--     ('Nutmeg', 'Whole nutmeg with rich aroma', 'Spices', 'Banda Islands, Indonesia', 'published', '/images/products/nutmeg.jpg'),
--     ('Black Pepper', 'Organic black pepper from Lampung', 'Spices', 'Lampung, Indonesia', 'published', '/images/products/pepper.jpg'),
--     ('Vanilla Beans', 'Premium Madagascar-style vanilla from Papua', 'Natural Products', 'Papua, Indonesia', 'published', '/images/products/vanilla.jpg');
