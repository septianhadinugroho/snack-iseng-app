# 🍿 Snack Iseng App (CMS)

Aplikasi manajemen usaha snack (UMKM) berbasis web yang didesain _mobile-first_. Aplikasi ini adalah **Progressive Web App (PWA)**, sehingga bisa diinstal langsung ke handphone layaknya aplikasi native, mendukung mode offline, dan memiliki antarmuka modern.

---

## ✨ Fitur Unggulan

- **📱 PWA Ready:** Bisa di-install di Android/iOS, ada icon di homescreen, dan splash screen
- **📊 Dashboard Real-time:** Grafik penjualan, total profit, pengeluaran, dan riwayat aktivitas
- **🛒 Manajemen Pesanan:** Catat pesanan masuk, status pembayaran (Lunas/Belum), dan status barang (Diterima/Diproses)
- **💸 Pencatatan Belanja:** Input pengeluaran belanja bahan baku dengan fitur hitung estimasi hasil (bungkus)
- **📂 Import Excel:** Support import data pesanan dan belanja massal via file `.xlsx`
- **📦 Stok & Harga:** Update harga produk dengan cepat dan penanda *Best Seller* otomatis
- **💳 QRIS Cepat:** Akses cepat ke QRIS toko untuk pembayaran pelanggan
- **🔔 Notifikasi:** Sistem notifikasi in-app dan Push Notification (Service Worker)

---

## 🚀 Demo Akun

Silakan coba aplikasi ini menggunakan akun tamu (Mode Demo):

| Role | Username | Password |
|:-----|:---------|:---------|
| **Tamu** | `demo` | `demo123` |

> **Catatan:** Pada mode demo, Anda bebas mencoba input/edit/hapus, namun data **tidak akan tersimpan** permanen ke database (Reset setiap sesi).

---

## 🛠️ Teknologi yang Digunakan

- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **PWA:** Vite PWA Plugin (Workbox)
- **Charting:** Chart.js & React-Chartjs-2
- **HTTP Client:** Axios
- **Routing:** React Router DOM v6

---

## 💻 Cara Install & Menjalankan (Local)

Pastikan kamu sudah menginstall [Node.js](https://nodejs.org/).

### 1. Clone repository ini

```bash
git clone https://github.com/username/snack-iseng-app.git
cd snack-iseng-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` di root folder, lalu isi URL backend API kamu:

```env
VITE_API_URL=http://localhost:3000/api
# Atau URL backend production kamu
```

### 4. Jalankan mode development

```bash
npm run dev
```

Buka browser di `http://localhost:5173`

### 5. Build untuk Production

```bash
npm run build
```

---

## 📱 Cara Install di HP (PWA)

1. Buka aplikasi via browser (Chrome/Safari)
2. Klik menu browser (titik tiga / tombol share)
3. Pilih **"Add to Home Screen"** atau **"Install App"**
4. Aplikasi akan muncul di menu HP kamu

---

## 📂 Struktur Project

```
src/
├── components/      # Komponen UI (Modal, Toast, Loading, Navbar)
├── pages/           # Halaman (Dashboard, Orders, Expenses, Login)
├── dev-dist/        # File Service Worker (PWA)
├── public/          # Aset statis (Logo, QRIS, Manifest)
├── utils/           # Helper function (Notifikasi)
├── api.js           # Konfigurasi Axios & Interceptor
├── App.jsx          # Routing Utama
└── main.jsx         # Entry Point
```

---

## 📝 Lisensi

Copyright © 2025 Snack Iseng Service

---

## 🤝 Kontribusi

Kontribusi, issues, dan feature requests sangat diterima!

Jangan lupa beri ⭐ jika project ini membantu kamu!