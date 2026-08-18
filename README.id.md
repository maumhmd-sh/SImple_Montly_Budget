# Monthly Budget

> Aplikasi manajemen keuangan pribadi full-stack untuk mengelola pemasukan, pengeluaran, budget, account, kategori, laporan, notifikasi, dan preferensi pengguna.

## ✨ Fitur

- 🔐 **Autentikasi** — login/logout JWT, protected route, dan redirect otomatis jika belum login.
- 📊 **Dashboard** — ringkasan kondisi keuangan serta pemasukan/pengeluaran.
- 💰 **Pemasukan** — tambah, lihat, ubah, dan hapus data pemasukan.
- 💸 **Pengeluaran** — tambah, lihat, ubah, dan hapus data pengeluaran.
- 🎯 **Budget** — budget kategori bulanan dengan validasi nominal dan periode.
- 🏦 **Account** — tambah, lihat, ubah, dan hapus account keuangan.
- 🏷️ **Kategori** — kategori income/expense dengan icon dan warna; CRUD lengkap.
- 🔔 **Notifikasi** — notifikasi aktivitas, unread counter, status read/unread, dan notification center.
- ⚙️ **Pengaturan** — profile, password/account, tema, dan accent color.
- 🌓 **Tema** — light, dark, dan system dengan penyimpanan preferensi.
- 🎨 **Accent Color** — blue, purple, green, orange, red, dan pink.
- 📈 **Laporan & Analytics** — laporan keuangan serta analisis income/expense.
- 🧭 **UX** — sidebar collapse, responsive layout, live clock, active navigation, dan user display.
- 🚫 **404 Custom** — halaman khusus untuk route yang tidak ditemukan.

### Event Notifikasi

Contoh:

- `Profile berhasil diperbarui`
- `Password berhasil diubah`
- `Income Rp500.000 ditambahkan`
- `Expense Rp75.000 dicatat`
- `Budget baru berhasil dibuat`
- `Account baru ditambahkan`

## 🧱 Teknologi

**Frontend:** Vue 3, Vite, Vue Router, Pinia, Axios, Bootstrap 5, Bootstrap Icons

**Backend:** Node.js, Express 5, Sequelize, MySQL/MariaDB, JWT, bcrypt/bcryptjs, CORS, dotenv

## 📁 Struktur

```text
monthly-budget/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   └── App.vue
│   └── package.json
├── package.json
└── README.md
```

## 🚀 Menjalankan

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

Backend + frontend sekaligus:

```bash
npm run dev
```

Terpisah:

```bash
npm run dev:backend
npm run dev:frontend
```

Build frontend:

```bash
npm run build
```

## 🔌 API

### Authentication & Profile

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/auth/register` | Registrasi |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | User yang sedang login |
| GET | `/api/auth/profile` | Ambil profile |
| PUT/PATCH | `/api/auth/profile` | Ubah profile |
| PUT/PATCH | `/api/auth/password` | Ubah password |
| POST | `/api/auth/logout` | Logout |

### Accounts

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/accounts` | Daftar account |
| POST | `/api/accounts` | Buat account |
| PUT | `/api/accounts/:id` | Ubah account |
| DELETE | `/api/accounts/:id` | Hapus account |

### Categories

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/categories` | Daftar kategori |
| POST | `/api/categories` | Buat kategori |
| PUT | `/api/categories/:id` | Ubah kategori |
| DELETE | `/api/categories/:id` | Hapus kategori |

### Income

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/incomes` | Daftar pemasukan |
| POST | `/api/incomes` | Buat pemasukan |
| GET | `/api/incomes/:id` | Detail pemasukan |
| PUT | `/api/incomes/:id` | Ubah pemasukan |
| DELETE | `/api/incomes/:id` | Hapus pemasukan |

### Expense

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/expenses` | Daftar pengeluaran |
| POST | `/api/expenses` | Buat pengeluaran |
| GET | `/api/expenses/:id` | Detail pengeluaran |
| PUT | `/api/expenses/:id` | Ubah pengeluaran |
| DELETE | `/api/expenses/:id` | Hapus pengeluaran |

### Budget

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/budgets` | Daftar budget |
| POST | `/api/budgets` | Buat budget |
| PUT | `/api/budgets/:id` | Ubah budget |
| DELETE | `/api/budgets/:id` | Hapus budget |

### Notifications

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/notifications` | Daftar notifikasi |
| GET | `/api/notifications/unread-count` | Jumlah unread |
| PUT | `/api/notifications/:id/read` | Tandai sudah dibaca |
| PUT | `/api/notifications/read-all` | Tandai semua sudah dibaca |

> Tabel API sebaiknya tetap disinkronkan dengan source backend terbaru sebelum dipublikasikan sebagai dokumentasi API.

## 🔑 Authentication

Request yang membutuhkan login menggunakan:

```http
Authorization: Bearer <TOKEN>
```

Contoh:

```bash
export TOKEN_USER4="YOUR_TOKEN"

curl -s http://localhost:3000/api/notifications   -H "Authorization: Bearer $TOKEN_USER4"
```

## 🗄️ Model Database

- User
- Account
- Category
- Transaction
- MonthlyBudget

## 🔒 Keamanan

Sebelum repository dibuat public:

- Jangan commit JWT/token.
- Jangan commit `.env`.
- Jangan hard-code credential database.
- Gunakan environment variable untuk secret.
- Ganti credential yang pernah ter-expose.
- Review CORS untuk production.
- Gunakan HTTPS di production.

## 🛣️ Roadmap

- Admin Dashboard
- Manajemen user/account oleh admin
- Advanced analytics
- Laporan lebih lengkap
- Export data
- History dan filter notifikasi
- Konfigurasi deployment production

## 📌 Status

**Active development**

Dibuat dengan Vue, Node.js, Express, Sequelize, dan banyak kopi. ☕
