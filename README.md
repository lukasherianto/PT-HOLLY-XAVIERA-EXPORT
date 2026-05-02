# 🌐 PT. Holly Xaviera Export - B2B E-commerce Website

Production-ready Vanilla JS SPA with Supabase backend for Indonesian coffee & spices exporter.

## 📁 Project Structure

```
/workspace
├── index.html              # Main SPA entry
├── admin/index.html        # Admin dashboard
├── src/
│   ├── css/
│   │   ├── variables.css   # CSS custom properties
│   │   ├── layout.css      # Layout styles
│   │   ├── components.css  # UI components
│   │   └── main.css        # Import all
│   └── js/
│       ├── config.js       # Configuration
│       ├── utils.js        # Utilities
│       ├── cart.js         # Cart module
│       ├── products.js     # Products module
│       ├── checkout.js     # Checkout module
│       └── app.js          # Main entry
├── supabase/
│   ├── migrations/001_initial_schema.sql
│   └── functions/submit-order/index.ts
├── public/                 # Static assets
├── nginx.conf              # Nginx config
└── .htaccess               # Apache config
```

## 🚀 Quick Start

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL migration:
   ```sql
   -- Copy contents of supabase/migrations/001_initial_schema.sql
   -- Paste into Supabase SQL Editor and run
   ```
3. Create storage buckets in Supabase Dashboard:
   - `product-images` (public)
   - `banner-images` (public)
   - `article-images` (public)

4. Get your credentials from Settings > API:
   - Project URL
   - Anon/Public Key
   - Service Role Key (for Edge Functions)

### 2. Configure Environment

Update these values in `src/js/config.js`:
```javascript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';
```

Update `src/js/app.js` with the same credentials.

### 3. Deploy Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy submit-order
```

Set environment variables for the function:
```bash
supabase secrets set RESEND_API_KEY=re_your_key
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Email Setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add verified domain or use default `@resend.dev` domain
4. Update Edge Function with your Resend key

### 5. Deploy Frontend

**Option A: Netlify**
```bash
# Drag & drop the workspace folder to netlify.com
# Or use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

**Option B: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option C: Manual (Nginx)**
```bash
# Copy files to server
scp -r /workspace/* user@server:/var/www/hollyxaviera/

# Copy nginx.conf to /etc/nginx/sites-available/
sudo cp nginx.conf /etc/nginx/sites-available/hollyxaviera

# Enable site
sudo ln -s /etc/nginx/sites-available/hollyxaviera /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## ✅ Testing Checklist

### Cart Functionality
- [ ] Add product to cart
- [ ] Cart badge updates
- [ ] Cart persists after refresh
- [ ] Update quantity in cart
- [ ] Remove item from cart
- [ ] Empty cart message shows

### Checkout Flow
- [ ] Open checkout modal
- [ ] Form validation works
- [ ] Submit sends data to Edge Function
- [ ] Success toast appears
- [ ] Cart clears after success
- [ ] Redirect to home

### Email Notifications
- [ ] Admin receives order email
- [ ] Customer receives confirmation
- [ ] Emails contain correct order details

### Admin Dashboard
- [ ] Access /admin
- [ ] View orders table
- [ ] CRUD operations work

### Performance
- [ ] Lighthouse Performance > 90
- [ ] Images lazy load
- [ ] No console errors

## 🔐 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Input sanitization (XSS prevention)
- ✅ Content Security Policy headers
- ✅ HTTPS enforcement
- ✅ Secure cookie settings
- ✅ Rate limiting via Supabase

## 📱 Mobile Support

- Responsive design (320px - 1440px+)
- Touch-friendly buttons (44px min)
- Mobile navigation menu
- Slide-out cart panel optimized

## 🛠️ Maintenance

### Clear Cache
```javascript
localStorage.clear();
location.reload();
```

### Update Product Images
Upload to Supabase Storage > product-images bucket, then copy URL to product record.

### Backup Database
Use Supabase Dashboard > Database > Backups, or:
```bash
pg_dump -h db.your-project.supabase.co -U postgres > backup.sql
```

## 📞 Support

For issues or questions, contact the development team.

---

**Built with:** Vanilla JS, Supabase, Resend  
**License:** Proprietary - PT. Holly Xaviera Export
