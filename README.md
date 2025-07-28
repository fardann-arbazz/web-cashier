````md
# 🧾 Web Kasir - Cashier Web Application

Proyek *Web Kasir* ini adalah aplikasi Point of Sale (POS) berbasis web, dibangun dengan *React + TypeScript* di sisi frontend, dan *Rust (Axum + MySQL)* di sisi backend.
Aplikasi ini memungkinkan pengguna (kasir atau admin) untuk mengelola transaksi penjualan, produk, pengguna, dan laporan secara efisien.

---

## 🚀 Tech Stack

### 🌐 Frontend
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) - Development bundler
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [Zod](https://zod.dev/) - Schema validation
- [Axios](https://axios-http.com/) - HTTP client
- [React Router](https://reactrouter.com/) - Routing

### 🦀 Backend
- [Rust](https://www.rust-lang.org/)
- [Axum](https://docs.rs/axum/latest/axum/) - Web framework
- [SQLx](https://docs.rs/sqlx/latest/sqlx/) or `mysql_async` - Database interaction
- [jsonwebtoken](https://docs.rs/jsonwebtoken/latest/jsonwebtoken/) - JWT Auth
- [tokio](https://tokio.rs/) - Async runtime
- [serde](https://serde.rs/) - Serialization
- [dotenv](https://docs.rs/dotenv/latest/dotenv/) - Environment config
- [uuid](https://docs.rs/uuid/latest/uuid/) - UUID generation

---

## 📁 Fitur Utama

- 🧾 Manajemen Transaksi
- 🛒 CRUD Produk / Barang
- 👨‍💼 Manajemen Pengguna & Role Kasir/Admin
- 💳 Metode Pembayaran (Tunai)
- 📊 Laporan Penjualan
- 🔎 Pencarian & Pagination
- 🧠 Validasi Otomatis (Middleware)
- 🔐 Login dengan JWT Token

---

## ⚙️ Instalasi & Penggunaan

### 📦 Backend (Rust)

```bash
# Clone repo
git clone https://github.com/username/web-kasir.git
cd web-kasir/backend

# Copy konfigurasi
cp .env.example .env

# Sesuaikan .env Anda:
# DATABASE_URL=mysql://user:password@localhost:3306/db_name
# JWT_SECRET=supersecretkey

# Build project
cargo build

# Jalankan migrasi SQLx atau SQL manual
sqlx migrate run

# Jalankan server
cargo run
````

### 🌐 Frontend (React)

```bash
cd web-kasir/frontend

# Install dependencies
npm install

# Jalankan server
npm run dev
```

> Aplikasi akan tersedia di `http://localhost:5173` (frontend) dan `http://localhost:8080` (backend default).

---

## 🔐 Autentikasi

* Login akan mengembalikan **JWT Token**
* Token dikirim melalui header:
  `Authorization: Bearer <token>`
* Role user bisa `admin` atau `kasir`

---

## 🗃️ Struktur Database

Tabel utama:

* `users` (id, username, password\_hash, role)
* `barang` (id, nama, harga, stok)
* `transactions` (id, invoice\_number, cashier\_id, total\_amount, payment\_method, etc.)
* `transaction_items` (id, transaction\_id, product\_id, quantity, subtotal)

---

## 📦 API Endpoint

### Auth

* `POST /login` → Login dan menerima JWT
* `GET /me` → Get user by token

### Users

* `GET /users` → Get semua user
* `POST /users` → Tambah user

### Barang / Produk

* `GET /barang`
* `POST /barang`
* `PUT /barang/:id`
* `DELETE /barang/:id`

### Transaksi

* `GET /transactions` → Support pagination & search
* `POST /transactions`

---

## 🛠️ Rencana Pengembangan

* [ ] Fitur refund transaksi
* [ ] Dukungan multi-store / cabang
* [ ] Statistik dashboard penjualan
* [ ] Peran karyawan + shift kerja
* [ ] Realtime data
* [ ] Export csv / pdf

---

## 💡 Kontribusi

Pull request sangat diterima! Jika kamu ingin menyumbang:

1. Fork repositori ini
2. Buat branch baru: `git checkout -b fitur-baru`
3. Commit dan push
4. Buat pull request ke `main`

---

## 👨‍💻 Developer

**Fardan Arbas**
Fullstack & Rust Developer
📧 Email: \[[fardanarbas5@gmail.com](fardanarbas5@gmail.com)]

---

## 📄 Lisensi

MIT License © 2025 Fardan Arbas
