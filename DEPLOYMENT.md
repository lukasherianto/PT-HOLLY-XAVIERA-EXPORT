# 🚀 DEPLOYMENT CHECKLIST

## Pre-Deployment Requirements

### 1. Supabase Setup
- [ ] Create Supabase project at https://supabase.com
- [ ] Run SQL migration (`/supabase/migrations/001_initial_schema.sql`)
- [ ] Create admin user in Supabase Auth
- [ ] Add admin user to `admin_profiles` table with role 'admin'
- [ ] Note your SUPABASE_URL and SUPABASE_ANON_KEY

### 2. Email Service Setup (Resend)
- [ ] Create account at https://resend.com
- [ ] Verify your domain for sending emails
- [ ] Get API key from Resend dashboard
- [ ] Add verified email as "From" address

### 3. Edge Function Deployment
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy Edge Function
supabase functions deploy submit-order

# Set environment variables for Edge Function
supabase secrets set RESEND_API_KEY=re_xxxxxx
supabase secrets set ADMIN_EMAIL=admin@hollyxaviera.com
supabase secrets set COMPANY_EMAIL=info@hollyxaviera.com
```

### 4. Frontend Configuration
- [ ] Copy `.env.example` to `.env` (for local development)
- [ ] Update `public/js/utils.js` with your Supabase credentials:
  ```javascript
  const CONFIG = {
      SUPABASE_URL: 'https://your-project.supabase.co',
      SUPABASE_ANON_KEY: 'your-anon-key',
      EDGE_FUNCTION_URL: 'https://your-project.supabase.co/functions/v1/submit-order'
  };
  ```

### 5. Storage Setup
- [ ] Verify storage buckets exist in Supabase dashboard
- [ ] Upload placeholder images if needed:
  - `product-images/` - Product photos
  - `banner-images/` - Hero banner images
  - `article-images/` - Article featured images
  - `company-assets/` - Logo, favicon

---

## Deployment Options

### Option A: Netlify (Recommended for simplicity)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build command (if using any build step)
# For vanilla JS, just deploy the public folder

# Deploy
netlify deploy --prod --dir=public

# Or drag & drop public folder to netlify.com
```

**Netlify Settings:**
- Build Command: (leave empty)
- Publish Directory: `public`
- Environment Variables: Add SUPABASE_URL, SUPABASE_ANON_KEY

**netlify.toml** (create in root):
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

### Option B: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**vercel.json** (create in root):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

---

### Option C: Traditional nginx Server

```bash
# SSH into server
ssh user@your-server.com

# Create directory
sudo mkdir -p /var/www/hollyxaviera/public

# Upload files
scp -r public/* user@your-server.com:/var/www/hollyxaviera/public/

# Copy nginx config
sudo cp nginx/nginx.conf /etc/nginx/sites-available/hollyxaviera.com
sudo ln -s /etc/nginx/sites-available/hollyxaviera.com /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d hollyxaviera.com -d www.hollyxaviera.com
```

---

## Post-Deployment Verification

### 1. Database Check
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Check seed data
SELECT * FROM settings LIMIT 1;
SELECT * FROM banners WHERE is_active = true;
```

### 2. Frontend Testing
- [ ] Homepage loads without errors
- [ ] Products section displays correctly
- [ ] Cart icon shows badge when items added
- [ ] Cart panel slides out smoothly
- [ ] Checkout form validates inputs
- [ ] Success modal appears after submission
- [ ] Mobile responsive design works (test on 320px width)
- [ ] Navigation works on mobile (hamburger menu)

### 3. Cart Functionality
- [ ] Add product to cart → badge updates
- [ ] Cart persists after page refresh
- [ ] Quantity controls work (+/- buttons)
- [ ] Remove item from cart works
- [ ] Empty cart shows appropriate message
- [ ] Checkout button disabled when cart empty

### 4. Order Submission Flow
- [ ] Fill checkout form with valid data
- [ ] Submit form → loading state appears
- [ ] Success modal shows order number
- [ ] Cart clears after successful submission
- [ ] Order appears in Supabase `orders` table
- [ ] Admin receives email notification
- [ ] Customer receives confirmation email

### 5. Admin Dashboard
- [ ] Navigate to #admin shows login modal
- [ ] Login with admin credentials works
- [ ] Dashboard loads with all tabs
- [ ] Orders tab shows recent inquiries
- [ ] Products tab lists all products
- [ ] Can add/edit/delete products
- [ ] Settings can be updated
- [ ] Logout works properly

### 6. Performance Testing
```bash
# Run Lighthouse audit
chrome://inspect/#devices

# Or use PageSpeed Insights
https://pagespeed.web.dev/

# Target scores:
# - Performance: > 90
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 95
```

### 7. Security Verification
- [ ] HTTPS enforced (no mixed content warnings)
- [ ] CSP headers present (check browser DevTools)
- [ ] No console.log statements in production
- [ ] Form inputs sanitized (try XSS payloads)
- [ ] RLS policies prevent unauthorized access
- [ ] External links have rel="noopener noreferrer"

---

## Monitoring & Maintenance

### Daily
- [ ] Check order submissions in admin dashboard
- [ ] Respond to customer inquiries within 24 hours

### Weekly
- [ ] Review error logs (browser console, server logs)
- [ ] Check email delivery rates in Resend dashboard
- [ ] Monitor Supabase usage and quotas

### Monthly
- [ ] Update product catalog as needed
- [ ] Review and optimize database queries
- [ ] Clear old cache entries if needed
- [ ] Backup database (Supabase auto-backups available)

---

## Troubleshooting

### Common Issues

**Cart not persisting:**
- Check localStorage is enabled in browser
- Verify Storage utility functions working
- Check browser console for errors

**Orders not appearing in admin:**
- Verify admin user has correct role in admin_profiles
- Check RLS policies allow admin access
- Verify Supabase connection in utils.js

**Emails not sending:**
- Check RESEND_API_KEY is set correctly
- Verify domain is verified in Resend
- Check Edge Function logs in Supabase dashboard
- Ensure "From" email matches verified domain

**Products not loading:**
- Check products table has data
- Verify is_active = true for products
- Clear browser cache and localStorage
- Check network tab for failed API calls

**Admin login fails:**
- Verify user exists in auth.users
- Check admin_profiles table has entry
- Ensure role is 'admin' or 'super_admin'
- Check browser console for auth errors

---

## Support Contacts

- **Supabase Support:** https://supabase.com/support
- **Resend Support:** https://resend.com/support
- **Netlify Support:** https://answers.netlify.com/
- **Vercel Support:** https://vercel.com/support

---

## Version History

- v1.0.0 - Initial release
  - Complete SPA with vanilla JS
  - Inquiry cart system
  - Admin dashboard
  - Email notifications
  - RLS security
