# PT. Holly Xaviera Export - E-commerce Website

A modern full-stack e-commerce website for an Indonesian export company based in Kepahiang, Bengkulu.

## Features

- **Online Store**: Browse products by category (Coffee, Spices, Palm Oil, Cocoa)
- **Shopping Cart**: Add/remove items, update quantities
- **Checkout System**: Submit orders without payment (manual confirmation)
- **Admin Dashboard**: Manage products, view orders
- **Blog**: Articles about commodities and export
- **Responsive Design**: Mobile-friendly UI

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database + Auth)
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies

```bash
cd xaviera-export
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mqkozdqaurjopcqqkhtx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=admin@xavieraexport.com
```

### 3. Database Setup (Supabase)

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  origin TEXT,
  specs JSONB,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT NOT NULL,
  country TEXT NOT NULL,
  notes TEXT,
  cart_items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url TEXT,
  banner_url TEXT,
  email TEXT,
  whatsapp TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (true);

-- Only authenticated users can modify
CREATE POLICY "Auth insert products" ON products FOR INSERT TO authenticated USING (true);
CREATE POLICY "Auth update products" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete products" ON products FOR DELETE TO authenticated USING (true);

-- Orders can be inserted by anyone
CREATE POLICY "Anyone insert orders" ON orders FOR INSERT TO anon, authenticated USING (true);
CREATE POLICY "Auth read orders" ON orders FOR SELECT TO authenticated USING (true);
```

### 4. Create Admin User

In Supabase Dashboard > Authentication > Users, add a new user:
- Email: admin@xavieraexport.com
- Password: (create a secure password)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages Structure

- `/` - Homepage with hero, featured products, CTA
- `/shop` - Product listing with category filter
- `/cart` - Shopping cart
- `/checkout` - Checkout form
- `/about` - Company information
- `/blog` - Articles and news
- `/contact` - Contact form and info
- `/admin` - Admin dashboard (protected)

## Order Flow

1. Customer browses products and adds to cart
2. Customer fills checkout form (name, email, WhatsApp, address, country)
3. Order is saved to Supabase `orders` table
4. Admin receives notification (via email integration or checks dashboard)
5. Admin contacts customer with total price + shipping cost
6. Manual payment arrangement outside the system

## Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:
- Primary: Pink/Rose tones
- Neutral: Warm gray tones

### Content
Update content in respective page files under `src/app/`

## Deployment

Recommended platforms:
- Vercel (easiest for Next.js)
- Netlify
- AWS Amplify

Make sure to set environment variables in your deployment platform.

## License

Copyright © 2024 PT. Holly Xaviera Export
