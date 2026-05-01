# Admin Panel - Deployment Instructions

## ⚠️ IMPORTANT: Choose Your Repository Type

Your GitHub Pages URL depends on your **repository name**:

### Option A: Repository named `lukasherianto.github.io` (User/Organization Site)
**URLs:**
- Main site: `https://lukasherianto.github.io/`
- Admin panel: `https://lukasherianto.github.io/admin/`
- Test page: `https://lukasherianto.github.io/admin/test.html`

**File Structure Required:**
```
lukasherianto.github.io/  (root)
├── index.html
├── admin/
│   ├── index.html
│   └── test.html
├── css/
│   └── styles.css
└── js/
    ├── app.js
    └── admin.js
```

### Option B: Repository named `holly-xaviera-export` (Project Site)
**URLs:**
- Main site: `https://lukasherianto.github.io/holly-xaviera-export/`
- Admin panel: `https://lukasherianto.github.io/holly-xaviera-export/admin/`
- Test page: `https://lukasherianto.github.io/holly-xaviera-export/admin/test.html`

**File Structure Required:**
```
holly-xaviera-export/  (root)
├── index.html
├── admin/
│   ├── index.html
│   └── test.html
├── css/
│   └── styles.css
└── js/
    ├── app.js
    └── admin.js
```

---

## 🔧 Quick Fix Steps

### Step 1: Check Your Repository Name

Go to GitHub and check your repository name:
- If it's `lukasherianto.github.io` → Use **Option A**
- If it's `holly-xaviera-export` → Use **Option B**

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `main` or `master`
   - Folder: `/ (root)`
4. Click **Save**
5. Wait 2-5 minutes for deployment

### Step 3: Test Your URLs

After deployment, try these URLs:

**For Option A (User Site):**
```
https://lukasherianto.github.io/admin/test.html
```

**For Option B (Project Site):**
```
https://lukasherianto.github.io/holly-xaviera-export/admin/test.html
```

The test page will show:
- ✅ Your current URL information
- ✅ Detected base path
- ✅ Working links to CSS and JS files

### Step 4: Access Admin Panel

Once the test page works, access the admin panel:

**For Option A:**
```
https://lukasherianto.github.io/admin/
```

**For Option B:**
```
https://lukasherianto.github.io/holly-xaviera-export/admin/
```

---

## 🐛 Troubleshooting

### Problem: 404 Error on Admin Page

**Solutions:**
1. Wait 2-5 minutes after pushing to GitHub
2. Check GitHub Actions tab for build errors
3. Verify GitHub Pages is enabled in Settings → Pages
4. Make sure files are in the correct location

### Problem: White/Blank Page

**Check Browser Console (F12):**
- Look for 404 errors on CSS/JS files
- Check for CORS errors
- Look for JavaScript errors

**Solutions:**
1. Clear browser cache: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Try incognito/private mode
3. Use the test page to verify paths: `/admin/test.html`

### Problem: CSS Not Loading

**Check:**
1. Is `css/styles.css` in your repository?
2. Does the test page show CSS loading correctly?
3. Try direct URL: `https://lukasherianto.github.io/css/styles.css`

---

## 📋 File Checklist

Before deploying, ensure these files exist:

- [ ] `/index.html`
- [ ] `/admin/index.html`
- [ ] `/admin/test.html`
- [ ] `/css/styles.css`
- [ ] `/js/app.js`
- [ ] `/js/admin.js`

---

## 🔐 Security Note

The admin panel currently uses **basic localStorage authentication** (demo only).

**Default password:** `admin123`

**Before production:**
1. Implement proper authentication (Supabase Auth recommended)
2. Update `.env` with your Supabase credentials
3. Execute `supabase-rls-policies.sql` in Supabase SQL Editor

---

## Need Help?

1. Visit the test page first: `/admin/test.html`
2. Check what base path is detected
3. Verify CSS/JS links work from the test page
4. Check browser console (F12) for specific errors
5. Verify GitHub Pages is enabled in repository settings
