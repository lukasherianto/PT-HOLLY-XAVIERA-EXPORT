# 🧪 QUICK TEST FLOW

Follow this step-by-step guide to verify the complete application works correctly.

---

## Phase 1: Database Setup (5 minutes)

### Step 1.1: Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Enter project name: `holly-xaviera-export`
4. Set database password (save it!)
5. Wait for project to provision (~2 minutes)

### Step 1.2: Run SQL Migration
1. Open SQL Editor in Supabase dashboard
2. Copy entire content from `/workspace/supabase/migrations/001_initial_schema.sql`
3. Paste and run
4. Verify success message appears

### Step 1.3: Create Admin User
1. Go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Email: `admin@hollyxaviera.com`
4. Password: `AdminPassword123!` (change in production!)
5. Click "Create user"

### Step 1.4: Grant Admin Role
1. Go to Table Editor → `admin_profiles`
2. Click "Insert"
3. Enter:
   - `id`: Copy user ID from Authentication page
   - `email`: `admin@hollyxaviera.com`
   - `role`: `admin`
4. Click "Save"

### Step 1.5: Add Sample Products
```sql
INSERT INTO products (name, slug, category, moq, description, image_url, is_active) VALUES
('Arabica Coffee Beans', 'arabica-coffee-beans', 'coffee', 100, 'Premium Indonesian Arabica coffee beans with rich flavor and aromatic profile.', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', true),
('Robusta Coffee Powder', 'robusta-coffee-powder', 'coffee', 200, 'Strong and bold Robusta coffee powder perfect for espresso blends.', 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=400', true),
('Ceylon Cinnamon Sticks', 'ceylon-cinnamon-sticks', 'spices', 50, 'Authentic Ceylon cinnamon sticks with sweet and delicate flavor.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', true),
('Organic Turmeric Powder', 'organic-turmeric-powder', 'spices', 100, 'Pure organic turmeric powder with high curcumin content.', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', true),
('Vanilla Beans Grade A', 'vanilla-beans-grade-a', 'natural', 25, 'Premium Madagascar vanilla beans, moist and aromatic.', 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400', true);
```

---

## Phase 2: Edge Function Setup (5 minutes)

### Step 2.1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2.2: Login and Link
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
# Find PROJECT_REF in Supabase dashboard → Settings → General
```

### Step 2.3: Deploy Edge Function
```bash
cd /workspace
supabase functions deploy submit-order
```

### Step 2.4: Set Secrets
```bash
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set ADMIN_EMAIL=admin@hollyxaviera.com
supabase secrets set COMPANY_EMAIL=info@hollyxaviera.com
```

**Note:** For testing without email setup, emails will be skipped if RESEND_API_KEY is not set. The order will still be saved to database.

---

## Phase 3: Frontend Configuration (2 minutes)

### Step 3.1: Update Configuration
Edit `/workspace/public/js/utils.js`:

```javascript
const CONFIG = {
    SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
    SUPABASE_ANON_KEY: 'YOUR_ANON_KEY_HERE',
    EDGE_FUNCTION_URL: 'https://YOUR_PROJECT.supabase.co/functions/v1/submit-order'
};
```

**Find these values in:**
- Supabase Dashboard → Settings → API
- URL: "Project URL"
- Key: "anon public"

---

## Phase 4: Local Testing (5 minutes)

### Step 4.1: Start Local Server
```bash
cd /workspace/public
python3 -m http.server 8000
# Or use any static server: npx serve, php -S localhost:8000, etc.
```

### Step 4.2: Test Homepage
1. Open http://localhost:8000
2. Verify:
   - [ ] Page loads without errors
   - [ ] Hero section displays
   - [ ] Products grid shows 5 sample products
   - [ ] No console errors (F12 → Console)

### Step 4.3: Test Cart System
1. Click "Add to Inquiry" on any product
2. Verify:
   - [ ] Toast notification appears ("Product added to inquiry cart")
   - [ ] Cart badge shows "1"
   - [ ] Click cart icon → panel slides out
   - [ ] Product appears in cart
3. Test quantity controls:
   - [ ] Click "+" → quantity increases
   - [ ] Click "-" → quantity decreases
   - [ ] Type number → updates correctly
4. Test remove:
   - [ ] Click "×" → item removed
   - [ ] Badge updates to "0"

### Step 4.4: Test Cart Persistence
1. Add 2-3 products to cart
2. Refresh page (F5)
3. Verify:
   - [ ] Cart badge still shows correct count
   - [ ] Items persist in cart panel

### Step 4.5: Test Checkout Flow
1. Add products to cart
2. Click cart icon → "Proceed to Inquiry"
3. Fill checkout form:
   ```
   Name: John Doe
   Company: Test Company
   Email: john@example.com
   WhatsApp: +628123456789
   Address: 123 Test Street, Jakarta
   Notes: Please send catalog
   ```
4. Submit form
5. Verify:
   - [ ] Loading state appears ("Submitting...")
   - [ ] Success modal shows with order number
   - [ ] Cart clears (badge shows "0")
   - [ ] Cart panel closes

---

## Phase 5: Backend Verification (3 minutes)

### Step 5.1: Check Order in Database
1. Go to Supabase Dashboard → Table Editor
2. Open `orders` table
3. Verify:
   - [ ] New order appears
   - [ ] Order number format: `HX-YYYYMMDD-XXXX`
   - [ ] Customer data correct
   - [ ] Items JSON contains cart products
   - [ ] Status is "pending"

### Step 5.2: Check Email (if Resend configured)
1. Check admin email inbox
2. Verify:
   - [ ] Email received within 10 seconds
   - [ ] Subject: "📦 New Inquiry #HX-..."
   - [ ] Contains customer details
   - [ ] Contains item list
3. Check customer email inbox
4. Verify:
   - [ ] Confirmation email received
   - [ ] Subject: "Inquiry Confirmation #HX-..."
   - [ ] Contains order summary

---

## Phase 6: Admin Dashboard Testing (5 minutes)

### Step 6.1: Access Admin
1. Navigate to http://localhost:8000/#admin
2. Verify:
   - [ ] Login modal appears
   - [ ] Enter credentials:
     - Email: `admin@hollyxaviera.com`
     - Password: `AdminPassword123!`
   - [ ] Login successful

### Step 6.2: Test Orders Tab
1. Verify:
   - [ ] Orders table displays
   - [ ] Recent order visible
   - [ ] Order number matches
   - [ ] Customer info correct
   - [ ] Status badge shows "Pending"
2. Test status update:
   - [ ] Change status to "Processing"
   - [ ] Badge updates immediately
   - [ ] Refresh → status persists

### Step 6.3: Test Products Tab
1. Verify:
   - [ ] All 5 products listed
   - [ ] Images display
   - [ ] MOQ shows correctly
2. Test add product:
   - [ ] Click "+ Add Product"
   - [ ] Fill prompts:
     - Name: "Test Product"
     - Category: "coffee"
     - MOQ: 100
     - Description: "Test"
     - Image URL: (any URL)
   - [ ] Product appears in table
3. Test edit:
   - [ ] Click "Edit" on any product
   - [ ] Change name
   - [ ] Save → updates
4. Test delete:
   - [ ] Click "Delete" on test product
   - [ ] Confirm → product removed

### Step 6.4: Test Settings Tab
1. Navigate to Settings tab
2. Change company name
3. Click "Save Settings"
4. Verify:
   - [ ] Success toast appears
   - [ ] Return to homepage → footer updated

### Step 6.5: Test Logout
1. Click "🚪 Logout"
2. Verify:
   - [ ] Dashboard closes
   - [ ] Redirected to homepage
   - [ ] Revisit #admin → login required again

---

## Phase 7: Mobile Responsiveness (3 minutes)

### Step 7.1: Test Mobile View
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone SE" (375px)
4. Verify:
   - [ ] Hamburger menu appears
   - [ ] Menu toggles open/closed
   - [ ] Products stack vertically
   - [ ] Cart panel takes full width
   - [ ] Forms are usable
   - [ ] Text is readable

### Step 7.2: Test Tablet View
1. Select "iPad" (768px)
2. Verify:
   - [ ] 2-column product grid
   - [ ] Navigation visible or hamburger
   - [ ] Layout proportional

---

## Phase 8: Performance Testing (5 minutes)

### Step 8.1: Run Lighthouse
1. Open Chrome DevTools → Lighthouse tab
2. Select all categories
3. Click "Analyze page load"
4. Verify scores:
   - [ ] Performance: > 90
   - [ ] Accessibility: > 90
   - [ ] Best Practices: > 90
   - [ ] SEO: > 95

### Step 8.2: Check Network Tab
1. DevTools → Network tab
2. Refresh page
3. Verify:
   - [ ] No failed requests (red)
   - [ ] CSS/JS load quickly (< 1s)
   - [ ] Images lazy load on scroll

---

## Phase 9: Security Testing (3 minutes)

### Step 9.1: XSS Prevention
1. Try adding product with malicious name (via admin):
   - Name: `<script>alert('XSS')</script>`
2. View on homepage
3. Verify:
   - [ ] Script does NOT execute
   - [ ] Tags are escaped (`&lt;script&gt;`)

### Step 9.2: Form Validation
1. Try submitting checkout with:
   - Empty name → Error shown
   - Invalid email (no @) → Error shown
   - Empty address → Error shown
2. Verify all validations work

### Step 9.3: RLS Policies
1. Try accessing orders without admin login:
   ```javascript
   // In browser console
   await supabase.from('orders').select('*')
   ```
2. Verify:
   - [ ] Returns empty array or error
   - [ ] Public cannot see orders

---

## ✅ Test Completion Checklist

Copy this checklist and mark items as you complete:

```
DATABASE SETUP
[ ] Supabase project created
[ ] SQL migration executed successfully
[ ] Admin user created
[ ] Admin role assigned
[ ] Sample products added

EDGE FUNCTION
[ ] Supabase CLI installed
[ ] Edge function deployed
[ ] Secrets configured

FRONTEND
[ ] Configuration updated
[ ] Homepage loads
[ ] Products display
[ ] Cart system works
[ ] Checkout flow works
[ ] Cart persists after refresh

ADMIN DASHBOARD
[ ] Login works
[ ] Orders visible
[ ] Status updates work
[ ] Products CRUD works
[ ] Settings update works
[ ] Logout works

MOBILE
[ ] Responsive on 320px
[ ] Hamburger menu works
[ ] Touch-friendly buttons

PERFORMANCE
[ ] Lighthouse Performance > 90
[ ] Lighthouse Accessibility > 90
[ ] Lighthouse Best Practices > 90
[ ] Lighthouse SEO > 95

SECURITY
[ ] XSS prevented
[ ] Form validation works
[ ] RLS policies working
[ ] HTTPS enforced (production)

EMAIL (if configured)
[ ] Admin receives notification
[ ] Customer receives confirmation
[ ] Emails arrive within 10s
```

---

## 🎉 Success Criteria Met When:

✅ All checkboxes above are marked  
✅ Zero console errors in production  
✅ Complete order flow works end-to-end  
✅ Admin can manage all content  
✅ Mobile experience is smooth  
✅ Lighthouse scores meet targets  

---

## 📞 Need Help?

If you encounter issues during testing:

1. **Check browser console** for errors
2. **Review Supabase logs** in dashboard
3. **Verify environment variables** are correct
4. **Clear browser cache** and localStorage
5. **Check network tab** for failed requests

Common fixes:
- Clear localStorage: `localStorage.clear()`
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check Supabase connection in utils.js
- Verify Edge Function URL is correct
