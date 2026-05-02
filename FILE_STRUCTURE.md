# 🗂️ File Structure

```
/workspace
├── index.html                    # Main SPA entry point
├── admin/
│   └── index.html                # Admin Dashboard (auth-protected)
├── src/
│   ├── css/
│   │   ├── variables.css         # CSS Custom Properties
│   │   ├── base.css              # Reset, Typography, Utilities
│   │   ├── layout.css            # Header, Footer, Grid
│   │   ├── components.css        # Cart, Modals, Cards, Forms
│   │   ├── admin.css             # Dashboard-specific styles
│   │   └── main.css              # Imports all CSS
│   ├── js/
│   │   ├── config.js             # Supabase config, constants
│   │   ├── utils.js              # Helpers, sanitization, caching
│   │   ├── router.js             # SPA routing
│   │   ├── cart.js               # Inquiry cart logic
│   │   ├── checkout.js           # Checkout form & validation
│   │   ├── products.js           # Product catalog rendering
│   │   ├── admin.js              # Dashboard CRUD operations
│   │   └── app.js                # Main initialization
│   └── images/                   # Static assets
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # Complete DB schema + RLS
│   └── functions/
│       └── submit-order/
│           └── index.ts          # Edge Function (email + DB)
├── public/
│   ├── _headers                  # Netlify/Vercel headers
│   └── _redirects                # SPA fallback
├── nginx.conf                    # Nginx security config
├── .htaccess                     # Apache security config
├── package.json                  # Dependencies (if needed)
└── README.md                     # Deployment guide
```
