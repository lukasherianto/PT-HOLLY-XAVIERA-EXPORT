# GitHub Pages Deployment Guide

## ⚠️ IMPORTANT: Correct URLs

Your GitHub Pages URL structure depends on your repository name:

### If your repository is named `holly-xaviera-export`:
- Main site: `https://lukasherianto.github.io/holly-xaviera-export/`
- Admin panel: `https://lukasherianto.github.io/holly-xaviera-export/admin/`

### If your repository is named `lukasherianto.github.io` (User/Org site):
- Main site: `https://lukasherianto.github.io/`
- Admin panel: `https://lukasherianto.github.io/admin/`

---

## 📋 Step-by-Step Deployment

### Option 1: Repository named `holly-xaviera-export` (Recommended)

```bash
# 1. Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - PT. Holly Xaviera Export website"

# 2. Add remote repository (replace with your actual repo)
git remote add origin https://github.com/lukasherianto/holly-xaviera-export.git

# 3. Push to GitHub
git branch -M main
git push -u origin main
```

**Access URLs:**
- Homepage: https://lukasherianto.github.io/holly-xaviera-export/
- Admin: https://lukasherianto.github.io/holly-xaviera-export/admin/

### Option 2: Repository named `lukasherianto.github.io` (User/Org site)

For this option, you need to move all files to the root or update paths:

```bash
# Files are already in root, just push
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/lukasherianto/lukasherianto.github.io.git
git branch -M main
git push -u origin main
```

**Access URLs:**
- Homepage: https://lukasherianto.github.io/
- Admin: https://lukasherianto.github.io/admin/

---

## 🔧 Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. Wait 2-5 minutes for deployment

---

## 🐛 Troubleshooting

### Admin page shows 404

**Cause**: Files not in correct location or GitHub Pages not enabled.

**Solution**:
1. Verify file structure:
   ```
   / (root)
   ├── index.html
   ├── admin/
   │   └── index.html
   ├── css/
   │   └── styles.css
   ├── js/
   │   ├── app.js
   │   └── admin.js
   └── ...
   ```

2. Check GitHub Pages is enabled in Settings → Pages

3. Wait for deployment to complete (check Actions tab)

### CSS/JS not loading

**Cause**: Incorrect relative paths.

**Solution**: The code has been updated with dynamic path detection. Clear browser cache:
- Chrome: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or use Incognito mode

### Blank white page

**Check browser console** (F12) for errors. Common issues:
- CORS errors → Check Supabase settings
- 404 errors → Verify file paths
- JavaScript errors → Check console messages

---

## 🔐 Security Note

The current admin authentication is **basic localStorage-based** (for demo only).

**Before production**:
1. Implement proper authentication (Supabase Auth recommended)
2. Update `.env` with your Supabase credentials
3. Execute `supabase-rls-policies.sql` in Supabase SQL Editor
4. Consider adding password protection via `.htaccess` (Apache) or server config

---

## 📊 Verify Deployment

After deployment, test these URLs:

✅ Main site:
```
https://lukasherianto.github.io/holly-xaviera-export/
```

✅ Admin panel:
```
https://lukasherianto.github.io/holly-xaviera-export/admin/
```

✅ Check assets load:
```
https://lukasherianto.github.io/holly-xaviera-export/css/styles.css
https://lukasherianto.github.io/holly-xaviera-export/js/app.js
```

---

## 🚀 Quick Test Command

```bash
# Test locally before pushing
npx serve .

# Then visit:
# http://localhost:3000/
# http://localhost:3000/admin/
```

---

## Need Help?

If you're still having issues:
1. Check GitHub Actions tab for build errors
2. Verify all files are committed and pushed
3. Clear browser cache and try incognito mode
4. Check browser console (F12) for specific errors
