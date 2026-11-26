# e-MMI RESOURCE HUB

Pusat Sumber dan Perkongsian Bahan **Menggantikan Masa Instruksional (MMI)** bagi Sekolah Menengah Malaysia (Tingkatan 1 hingga Tingkatan 5).

---

## 📌 Pengenalan & Objektif
Aplikasi web ini dibina khas untuk para guru sekolah menengah Malaysia bagi memudahkan proses perkongsian, carian, dan muat turun bahan pengajaran semasa jadual ganti (relief classes). Dengan e-MMI Resource Hub, masa instruksional murid sentiasa terisi dengan latihan terancang dan berkualiti sama ada secara bercetak mahupun digital.

---

## 🚀 Ciri-Ciri Utama

1. **Dashboard Eksekutif**:
   - Bar carian pintar dengan cadangan kata kunci popular.
   - Statistik masa-nyata: Jumlah Bahan, Akses Muat Turun, Bahan Digital, dan Bukan Digital.
   - Navigasi pantas mengikut tahap Tingkatan 1 hingga 5.
   - Senarai bahan instruksional terkini.

2. **Katalog Bahan Komprehensif**:
   - Penapisan pelbagai dimensi: Mata Pelajaran, Tingkatan (T1-T5), Kategori (Digital vs Bukan Digital), dan Format Fail (PDF, DOCX, PPTX, XLSX, Video, Imej, Pautan Luar).
   - Kad bahan lengkap dengan panduan guru pengganti, maklumat penyumbang, dan kiraan muat turun.
   - Sistem Pagination kemas.

3. **Muat Naik & Penerbitan Bahan**:
   - Log masuk melalui Google Authentication.
   - Borang pengesahan medan dan fail (Had saiz sehingga 50MB).
   - Menyokong pautan Google Drive, YouTube, Google Forms, Quizizz, Wordwall, dan fail fizikal.
   - Penerbitan automatik serta-merta tanpa perlu menunggu kelulusan admin.

4. **Modul Bahan Saya**:
   - Pengurusan bahan peribadi yang disumbangkan oleh guru.
   - Pengesahan keselamatan modal sebelum penghapusan bahan.

5. **Pengurusan Mata Pelajaran**:
   - Senarai kurikulum sekolah menengah: Bahasa Melayu, Bahasa Inggeris, Matematik, Sains, Sejarah, Geografi, Pendidikan Islam, Pendidikan Moral, RBT, ASK, PSV, PJPK, Fizik, Kimia, Biologi, Matematik Tambahan, Prinsip Akaun, Perniagaan, Ekonomi, dan lain-lain.
   - Keupayaan menambah mata pelajaran baharu secara dinamik.

6. **Analitik Masa-Nyata**:
   - Statistik sebenar berasaskan rekod pangkalan data (tiada angka rekaan).
   - Taburan peratusan mengikut tingkatan.
   - Nisbah bahan digital berbanding bukan digital.
   - Kedudukan mata pelajaran paling aktif dan senarai guru penyumbang terbanyak.

7. **PWA (Progressive Web App) & Mod Luar Talian**:
   - Web App Manifest (`manifest.json`) dan Service Worker (`sw.js`).
   - Butang pemasangan dalam aplikasi (*In-App Install Prompt*) untuk desktop dan panduan khusus iOS Safari.
   - Pengesan status sambungan internet berserta makluman mod luar talian.

8. **Integrasi Google Apps Script (Pilihan)**:
   - Skrip webhook `gas/Code.gs` untuk menyelaraskan rekod bahan terus ke Google Sheets pentadbir sekolah.

---

## 🛠️ Arahan Pemasangan & Persediaan

### 1. Pemasangan Dependensi
```bash
npm install
```

### 2. Konfigurasi Fail `.env`
Bina fail `.env` pada folder utama projek berdasarkan templat `.env.example`:
```env
# Kunci Firebase
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="emmi-hub.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="emmi-hub"
VITE_FIREBASE_STORAGE_BUCKET="emmi-hub.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"

# Google Apps Script Webhook (Pilihan)
VITE_GAS_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
```

*Nota: Sekiranya Firebase belum dikonfigurasikan, aplikasi akan berjalan dalam **Mod Pratonton (Demo Mode)** secara automatik dengan data interaktif yang dilabel 'DEMO' tanpa menjejaskan sebarang fungsi visual.*

### 3. Melancarkan Pelayan Pembangunan
```bash
npm run dev
```

### 4. Membina untuk Produksi
```bash
npm run build
```

---

## 🛡️ Keselamatan Firebase (Security Rules)

- **Firestore Rules (`firestore.rules`)**:
  - Orang awam dibenarkan membaca bahan berstatus `published`.
  - Hanya guru log masuk Google dibenarkan memuat naik bahan.
  - Setiap guru hanya dibenarkan menyunting atau memadam bahan miliknya sahaja (`ownerUid == request.auth.uid`).
  - Had akses kiraan muat turun dikawal dengan selamat.

- **Storage Rules (`storage.rules`)**:
  - Had fail dihadkan kepada 50MB.
  - Validasi ketat jenis MIME fail (PDF, dokumen pejabat, imej, video).
  - Guru hanya boleh menulis dan memadam fail dalam folder `resources/{userId}/` miliknya.
