# PT. Holly Xaviera Export - Production Deployment Guide

## 📋 Executive Summary

This document provides a complete production-ready deployment guide for the PT. Holly Xaviera Export website, optimized for performance, security, and SEO.

---

## 📊 Optimization Summary Table

| Category | Optimization | Impact Estimate | Priority | Effort |
|----------|-------------|-----------------|----------|--------|
| **Performance** | Critical CSS Inlining | +15 Lighthouse | HIGH | Low |
| **Performance** | Lazy Loading Images | +20 Lighthouse | HIGH | Medium |
| **Performance** | Font Display Swap | +5 Lighthouse | HIGH | Low |
| **Performance** | Code Splitting (Admin) | +10 Lighthouse | MEDIUM | Medium |
| **Performance** | Resource Hints | +8 Lighthouse | HIGH | Low |
| **Performance** | localStorage Caching | +12 Lighthouse | HIGH | Medium |
| **Security** | CSP Headers | Critical | CRITICAL | Low |
| **Security** | Input Sanitization | Critical | CRITICAL | Medium |
| **Security** | Supabase RLS Policies | Critical | CRITICAL | High |
| **Security** | Rate Limiting | Critical | CRITICAL | Medium |
| **Accessibility** | ARIA Labels | +15 Accessibility | MEDIUM | Low |
| **Accessibility** | Skip Links | +10 Accessibility | MEDIUM | Low |
| **Accessibility** | Focus Management | +10 Accessibility | MEDIUM | Medium |
| **PWA** | manifest.json | Installable | HIGH | Low |
| **PWA** | Service Worker | Offline Support | HIGH | High |
| **SEO** | Structured Data | +20 SEO | HIGH | Medium |
| **SEO** | Open Graph Tags | Social Sharing | HIGH | Low |
| **SEO** | sitemap.xml | Indexing | HIGH | Low |

---

## 🗂️ Recommended File Structure

```
/workspace/
├── index.html              # Main HTML with critical CSS inline
├── css/
│   ├── styles.css          # Main stylesheet (deferred)
│   └── critical.css        # Critical above-the-fold CSS
├── js/
│   ├── app.js              # Main application (deferred)
│   └── admin.js            # Admin-specific JS (code split)
├── admin/
│   ├── index.html          # Admin dashboard
│   └── admin.js            # Admin JavaScript
├── pwa/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker
│   └── icons/              # PWA icons (72px - 512px)
├── images/
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── favicon.ico
│   └── products/           # Product images (WebP + fallback)
├── .env.example            # Environment variables template
├── nginx.conf              # Nginx server configuration
├── robots.txt              # Search engine instructions
├── sitemap.xml             # XML sitemap
├── supabase-rls-policies.sql  # Database security policies
└── README.md               # This file
```

---

## 🔐 Security Implementation

### 1. Content Security Policy (CSP)

The CSP is implemented via meta tag in `index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'">
```

### 2. Input Sanitization

All user inputs are sanitized using DOM-based sanitization in `js/app.js`:

```javascript
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML.trim();
}
```

### 3. Supabase RLS Policies

Execute `supabase-rls-policies.sql` in your Supabase SQL Editor to enable Row Level Security.

---

## ⚡ Performance Optimizations

### Critical CSS Strategy

Critical CSS is inlined in the `<head>` of `index.html`. Non-critical CSS is loaded asynchronously:

```html
<link rel="stylesheet" href="css/styles.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="css/styles.css"></noscript>
```

### Image Lazy Loading

Images use Intersection Observer with WebP fallback:

```html
<img 
    class="product-image lazy" 
    data-src="/images/product.jpg" 
    data-src-webp="/images/product.webp"
    alt="Product name"
    loading="lazy"
    width="400"
    height="200"
>
```

### Resource Hints

```html
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="font" href="fonts/inter-var.woff2" type="font/woff2" crossorigin>
```

---

## 📱 PWA Implementation

### manifest.json Configuration

Located at `/pwa/manifest.json` with:
- Multiple icon sizes (72px - 512px)
- Theme color: `#2d501a`
- Background color: `#f5f1e8`
- App shortcuts for Products and Contact

### Service Worker Features

- Cache-first strategy for static assets
- Stale-while-revalidate for API calls
- Network-first for navigation
- Background sync support
- Push notification support

---

## 🔍 SEO Enhancements

### Structured Data (JSON-LD)

Two schema types implemented:
1. **Organization** - Company information
2. **WebSite** - Site search capability

### Open Graph & Twitter Cards

Complete meta tags for social sharing on Facebook, LinkedIn, and Twitter.

### hreflang Support

Multi-language readiness with English and Indonesian alternates.

---

## ⚙️ Server Configuration

### Nginx Features

- HTTP to HTTPS redirect
- Modern TLS 1.2/1.3 configuration
- Gzip compression
- Static asset caching (1 year for immutable assets)
- Rate limiting (10r/s general, 5r/s API, 1r/m login)
- Security headers (HSTS, X-Frame-Options, etc.)
- SPA fallback routing

### Apache Alternative (.htaccess)

For Apache hosting, create `.htaccess` with equivalent rules.

---

## ✅ Production Deployment Checklist

### Pre-Deployment

- [ ] Copy `.env.example` to `.env` and fill in values
- [ ] Update Supabase URL and keys
- [ ] Generate SSL certificate (Let's Encrypt recommended)
- [ ] Create all required database tables
- [ ] Execute RLS policies SQL
- [ ] Generate PWA icons (use tool like realfavicongenerator.net)
- [ ] Optimize all images (convert to WebP)

### Deployment

- [ ] Upload files to server
- [ ] Configure nginx.conf (update domain names)
- [ ] Set correct file permissions (755 directories, 644 files)
- [ ] Enable gzip/brotli compression
- [ ] Configure rate limiting
- [ ] Set up monitoring (Sentry, Google Analytics)

### Post-Deployment

- [ ] Test HTTPS redirect
- [ ] Verify security headers (use securityheaders.com)
- [ ] Run Lighthouse audit (target: 90+ all categories)
- [ ] Test PWA installability
- [ ] Verify offline functionality
- [ ] Test contact form submission
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Test Core Web Vitals (PageSpeed Insights)
- [ ] Verify structured data (Rich Results Test)

---

## 🧪 Quick Start Commands

### Development

```bash
# Start local server (Node.js)
npx serve .

# Or use Python
python -m http.server 8000

# Validate HTML
npx html-validator index.html

# Check accessibility
npx pa11y http://localhost:8000
```

### Build & Optimization

```bash
# Minify CSS
npm install -g clean-css-cli
cleancss -o css/styles.min.css css/styles.css

# Minify JavaScript
npm install -g terser
terser js/app.js -o js/app.min.js -c -m

# Optimize images
npm install -g sharp-cli
sharp images/product.jpg -o images/product.webp -q 85

# Generate sitemap (if dynamic)
node scripts/generate-sitemap.js
```

### Testing

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Performance testing
npm install -g lighthouse
lighthouse http://localhost:8000 --view

# Security headers check
curl -I https://www.hollyxavieraexport.com | grep -E "(Strict-Transport|X-Frame|X-Content|Content-Security)"
```

### Deployment

```bash
# Deploy via rsync
rsync -avz --delete ./ user@server:/var/www/hollyxavieraexport/public/

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx

# Clear cache (if needed)
sudo rm -rf /var/cache/nginx/*
sudo systemctl restart nginx
```

---

## 📈 Monitoring & Maintenance

### Recommended Tools

| Tool | Purpose | Setup |
|------|---------|-------|
| Google Analytics | Traffic analytics | Add GA4 tag |
| Google Search Console | SEO monitoring | Verify domain |
| Sentry | Error tracking | Add DSN to .env |
| Uptime Robot | Uptime monitoring | Add URL |
| PageSpeed Insights | Performance | Manual checks |

### Regular Maintenance

- Weekly: Check error logs
- Monthly: Review Core Web Vitals
- Quarterly: Update dependencies
- Annually: Renew SSL certificate

---

## 🆘 Troubleshooting

### Common Issues

**Service Worker not registering:**
- Ensure served over HTTPS
- Check scope in manifest.json
- Verify sw.js path is correct

**CSP errors in console:**
- Review allowed domains in CSP
- Add missing sources incrementally
- Use report-uri for debugging

**RLS policy blocking access:**
- Check auth.uid() matches user ID
- Verify role assignments in users table
- Test policies in Supabase dashboard

---

## 📞 Support

For issues or questions:
- Check browser console for errors
- Review nginx error logs: `/var/log/nginx/error.log`
- Test Supabase connection in network tab
- Validate HTML/CSS at W3C validators

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Maintained by:** Development Team
