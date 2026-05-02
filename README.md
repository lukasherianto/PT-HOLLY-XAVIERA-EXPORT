# PT. Holly Xaviera Export - B2B E-commerce Website

Website profesional untuk PT. Holly Xaviera Export, eksportir B2B kopi dan rempah-rempah premium Indonesia.

## 📁 Struktur File

```
/workspace
├── index.html              # Website utama (Public)
├── admin/
│   └── index.html          # Admin Dashboard
├── src/
│   └── images/             # Folder gambar
├── README.md               # Dokumentasi ini
└── .git/                   # Git repository
```

## 🚀 Cara Upload ke GitHub Pages

### Metode 1: Upload Manual via Browser (Paling Mudah)

1. **Buka Repository GitHub Anda:**
   - Kunjungi: https://github.com/lukasherianto/PT-HOLLY-XAVIERA-EXPORT

2. **Upload File:**
   - Klik "uploading an existing file"
   - Drag & drop file-file berikut dari komputer Anda:
     - `index.html`
     - `README.md`
     - Folder `admin/` (seluruh isi)
     - Folder `src/` (seluruh isi)
   - Atau copy-paste semua file dari folder: `C:\Users\Lenovo\Documents\GitHub\PT-HOLLY-XAVIERA-EXPORT`
   - Commit message: "Initial commit"
   - Klik "Commit changes"

3. **Aktifkan GitHub Pages:**
   - Di repository GitHub, klik tab **Settings**
   - Klik menu **Pages** di sebelah kiri
   - Pada bagian **Branch**, pilih **main** dan folder **(root)**
   - Klik **Save**

4. **Tunggu 1-3 menit**, lalu akses:
   - 🌐 https://lukasherianto.github.io/PT-HOLLY-XAVIERA-EXPORT/
   - 🔧 Admin: https://lukasherianto.github.io/PT-HOLLY-XAVIERA-EXPORT/admin/

### Metode 2: Menggunakan Git Command Line

Jika sudah install Git:

```cmd
cd C:\Users\Lenovo\Documents\GitHub\PT-HOLLY-XAVIERA-EXPORT
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/lukasherianto/PT-HOLLY-XAVIERA-EXPORT.git
git push -u origin main
```

Kemudian aktifkan GitHub Pages seperti langkah di atas.

## ✨ Fitur Website

### Public Website (`index.html`)
- ✅ Hero banner dengan CTA
- ✅ Katalog produk dengan filter kategori
- ✅ Pencarian produk (debounced)
- ✅ Inquiry Cart (localStorage persistence)
- ✅ Form checkout dengan validasi
- ✅ Responsive design (mobile-first)
- ✅ Security: CSP, XSS sanitization
- ✅ Performance: Lazy loading, critical CSS

### Admin Dashboard (`admin/index.html`)
- ✅ Login screen dengan auth guard
- ✅ Orders/Inquiries table view
- ✅ Product management (CRUD)
- ✅ Company settings
- ✅ Tab navigation
- ✅ Demo mode (ready for Supabase integration)

## 🔧 Konfigurasi Supabase (Opsional)

Untuk mengaktifkan backend penuh:

1. Buat project di https://supabase.com
2. Jalankan SQL migration (lihat dokumentasi lengkap)
3. Update konfigurasi di `index.html`:
   ```javascript
   const CONFIG = {
       SUPABASE_URL: 'https://your-project.supabase.co',
       SUPABASE_ANON_KEY: 'your-anon-key'
   };
   ```

## 📱 Testing Checklist

- [ ] Homepage loads correctly
- [ ] Products displayed with filters
- [ ] Search functionality works
- [ ] Add to cart updates badge
- [ ] Cart panel opens/closes
- [ ] Checkout form validation
- [ ] Mobile responsive (320px+)
- [ ] Admin login works
- [ ] Admin tabs navigate correctly

## 📞 Kontak

PT. Holly Xaviera Export
Email: info@hollyxaviera.com
WhatsApp: +62 812-3456-7890
Jakarta, Indonesia

---

© 2024 PT. Holly Xaviera Export. All rights reserved.
