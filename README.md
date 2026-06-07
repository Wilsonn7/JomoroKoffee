# ☕ Jomoro Koffee — Backend Microservices API

Backend sistem Point of Sale (POS) untuk **Jomoro Koffee** yang dibangun menggunakan arsitektur microservice dengan NestJS. Sistem ini terdiri dari 3 service terpisah yang berkomunikasi via HTTP REST.

---

## 📁 Struktur Proyek

```
JomoroKoffee/
├── auth-service/          # Service autentikasi (Port 3001)
├── product-service/       # Service produk & kategori (Port 3002)
└── transaction-service/   # Service transaksi & cart (Port 3003)
```

---

## 🛠️ Tech Stack

| Teknologi         | Keterangan                                  |
|-------------------|---------------------------------------------|
| **NestJS**        | Framework backend (TypeScript)              |
| **Prisma ORM**    | Database ORM (versi 5)                      |
| **MySQL**         | Database (via XAMPP / MySQL Server)         |
| **JWT + Passport**| Autentikasi & Otorisasi                     |
| **Swagger**       | Dokumentasi API otomatis                    |
| **class-validator**| Validasi input & DTO                       |
| **native fetch**  | Inter-service HTTP communication            |

---

## 🗄️ Database

| Service              | Database             |
|----------------------|----------------------|
| `auth-service`       | `jomoro_auth`        |
| `product-service`    | `jomoro_product`     |
| `transaction-service`| `jomoro_transaction` |

**Koneksi default:**
```
Host     : localhost
Port     : 3306
User     : root
Password : (kosong)
```

---

## 🚀 Menjalankan Semua Service

### Prasyarat
- Node.js >= 18
- MySQL / XAMPP (pastikan MySQL berjalan di port 3306)
- npm

### Langkah 1: Jalankan MySQL
Jika menggunakan XAMPP:
```cmd
C:\xampp\mysql_start.bat
```

### Langkah 2: Buat Database
```sql
CREATE DATABASE IF NOT EXISTS jomoro_auth;
CREATE DATABASE IF NOT EXISTS jomoro_product;
CREATE DATABASE IF NOT EXISTS jomoro_transaction;
```

### Langkah 3: Push Skema Prisma (setiap service)
```bash
cd auth-service && npx prisma db push
cd ../product-service && npx prisma db push
cd ../transaction-service && npx prisma db push
```

### Langkah 4: Jalankan Semua Service
Buka 3 terminal terpisah:

```bash
# Terminal 1 — Auth Service (Port 3001)
cd auth-service
npm run start

# Terminal 2 — Product Service (Port 3002)
cd product-service
npm run start

# Terminal 3 — Transaction Service (Port 3003)
cd transaction-service
npm run start
```

---

## 📄 Swagger API Documentation

Setelah semua service berjalan, buka di browser:

| Service              | URL Swagger                         |
|----------------------|-------------------------------------|
| Auth Service         | http://localhost:3001/api           |
| Product Service      | http://localhost:3002/api           |
| Transaction Service  | http://localhost:3003/api           |

---

## 🔐 AUTH SERVICE (Port 3001)

### Skema Database
```prisma
model users {
  id         Int    @id @default(autoincrement())
  first_name String @db.VarChar(255)
  last_name  String @db.VarChar(255)
  email      String @db.VarChar(255)
  password   String @db.VarChar(255)
  role       String @db.VarChar(25)  // default: "CUSTOMER"
}
```

### Endpoints

#### `POST /auth/register`
Mendaftarkan pengguna baru.

**Request Body:**
```json
{
  "first_name": "Ozan",
  "last_name": "Koffee",
  "email": "ozan@jomoro.id",
  "password": "ozanpass26"
}
```

**Aturan Validasi:**
| Field        | Aturan                                                          |
|--------------|-----------------------------------------------------------------|
| `first_name` | `@IsAlpha()` — hanya huruf, tanpa spasi/angka                 |
| `last_name`  | `@IsAlpha()` — hanya huruf, tanpa spasi/angka                 |
| `email`      | `@IsEmail()` + domain valid (`.com`, `.net`, `.org`, `.id`)   |
| `password`   | Min 8 karakter, tanpa spasi, minimal 2 angka                   |

**Response (201):**
```json
{ "message": "User registered successfully" }
```

---

#### `POST /auth/login`
Login dan mendapatkan JWT token.

**Request Body:**
```json
{
  "email": "ozan@jomoro.id",
  "password": "ozanpass26"
}
```

**Response (200):**
```json
{ "access_token": "<JWT_TOKEN>" }
```

---

#### `GET /auth/profile` 🔒
Mengambil data profil pengguna yang sedang login.

**Header:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "first_name": "Ozan",
  "last_name": "Koffee",
  "email": "ozan@jomoro.id",
  "role": "CUSTOMER"
}
```

---

## 📦 PRODUCT SERVICE (Port 3002)

### Skema Database
```prisma
model categories {
  id       Int        @id @default(autoincrement())
  name     String     @db.VarChar(255)
  products products[]
}

model products {
  id          Int        @id @default(autoincrement())
  name        String     @db.VarChar(255)
  description String     @db.VarChar(255)
  price       Float
  stock       Int
  image_url   String?    @db.VarChar(255)
  category_id Int
  category    categories @relation(fields: [category_id], references: [id])
}
```

> ⚠️ Saat pertama kali dijalankan, service ini otomatis menyemai 3 kategori default: **Coffee**, **Non-Coffee**, dan **Snack**.

### Endpoints Publik (Tanpa Token)

#### `GET /products`
Mengambil semua produk.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Arabica Black Coffee",
    "description": "...",
    "price": 22000,
    "stock": 45,
    "image_url": null,
    "category_id": 1,
    "category": { "id": 1, "name": "Coffee" }
  }
]
```

#### `GET /products/:id`
Mengambil detail produk berdasarkan ID.

#### `GET /categories`
Mengambil semua kategori.

#### `GET /categories/:categoryId/products`
Mengambil semua produk dalam satu kategori.

---

### Endpoints Admin 🔒 (Perlu Token ADMIN)

#### `POST /admin/products`
Membuat produk baru.

**Header:** `Authorization: Bearer <ADMIN_TOKEN>`

**Request Body:**
```json
{
  "name": "Arabica Black Coffee",
  "description": "Kopi hitam arabica pilihan dari pegunungan Aceh.",
  "price": 22000,
  "stock": 50,
  "image_url": "http://example.com/kopi.jpg",
  "category_id": 1
}
```

**Aturan Validasi:**
| Field         | Aturan                                            |
|---------------|---------------------------------------------------|
| `name`        | `@MinWords(3)` — minimal 3 kata                  |
| `description` | `@MinLength(20)` — minimal 20 karakter           |
| `price`       | `@IsInt()`, `@Min(1)` — integer, minimal 1       |
| `stock`       | `@IsInt()`, `@Min(0)`, `@Max(999)`               |
| `image_url`   | Opsional (nullable)                              |
| `category_id` | `@IsInt()` + cek kategori exist di database      |

#### `POST /admin/products/:id/update`
Mengupdate produk (validasi sama seperti create).

#### `POST /admin/products/:id/reduce`
Mengurangi stok produk.

**Request Body:**
```json
{ "quantity": 5 }
```

> ℹ️ Endpoint ini dapat diakses oleh role **ADMIN** dan **CUSTOMER** (digunakan oleh Transaction Service saat checkout).

#### `POST /admin/products/:id/delete`
Menghapus produk berdasarkan ID.

---

## 🛒 TRANSACTION SERVICE (Port 3003)

Semua endpoint di service ini **memerlukan JWT token** (role apapun).

### Skema Database
```prisma
model carts {
  id         Int          @id @default(autoincrement())
  user_id    Int
  cart_items cart_items[]
}

model cart_items {
  id         Int   @id @default(autoincrement())
  cart_id    Int
  product_id Int
  quantity   Int
  cart       carts @relation(fields: [cart_id], references: [id])
}

model orders {
  id            Int            @id @default(autoincrement())
  user_id       Int
  created_at    DateTime       @default(now())
  order_details order_details[]
}

model order_details {
  id         Int    @id @default(autoincrement())
  order_id   Int
  product_id Int
  price      Float  // snapshot harga saat checkout
  quantity   Int
  order      orders @relation(fields: [order_id], references: [id])
}
```

### CART Endpoints

#### `GET /cart` 🔒
Mengambil isi cart user yang sedang login (diperkaya dengan nama & harga dari Product Service).

**Response (200):**
```json
[
  {
    "product_id": 1,
    "name": "Arabica Black Coffee",
    "price": 22000,
    "quantity": 5
  }
]
```

#### `POST /cart` 🔒
Menambahkan produk ke cart.

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Business Logic:**
- Cek produk exist di Product Service
- Cek quantity ≤ stok produk
- Cek duplikat: produk yang sama tidak bisa ditambah dua kali (gunakan update)

#### `POST /cart/:product_id/update` 🔒
Mengupdate quantity item di cart.

**Request Body:**
```json
{ "quantity": 5 }
```

#### `POST /cart/:product_id/delete` 🔒
Menghapus item dari cart.

#### `POST /cart/clear` 🔒
Mengosongkan semua item di cart.

---

### ORDER Endpoints

#### `GET /orders` 🔒
Mengambil semua riwayat order milik user yang sedang login.

#### `POST /orders/:id` 🔒
Mengambil detail order tertentu (diperkaya nama produk dari Product Service).

**Response (200):**
```json
[
  {
    "product_id": 1,
    "name": "Arabica Black Coffee",
    "quantity": 5,
    "price": 22000
  }
]
```

#### `GET /profiles` 🔒
Mengambil profil user melalui proxy ke Auth Service.

**Response (200):**
```json
{
  "first_name": "Ozan",
  "last_name": "Koffee",
  "email": "ozan@jomoro.id",
  "role": "CUSTOMER"
}
```

#### `POST /orders` 🔒 — CHECKOUT
Melakukan checkout dari cart aktif user.

**Business Logic:**
1. Validasi cart tidak kosong
2. Validasi stok semua produk di cart
3. Membuat record `orders` baru
4. Membuat `order_details` (snapshot harga saat checkout)
5. Memanggil Product Service untuk mengurangi stok tiap produk
6. Mengosongkan cart secara otomatis

**Response (201):**
```json
{ "message": "Checkout successful" }
```

---

## 🔄 Inter-Service Communication

Service-service berkomunikasi via native `fetch` HTTP. Token JWT diteruskan (forwarded) untuk endpoint yang memerlukan autentikasi.

```
┌─────────────────────────────────┐
│  Transaction Service (:3003)    │
│                                 │
│  GET /cart      ──────────────► │──► GET  /products/:id      [Product Service]
│  POST /cart     ──────────────► │──► GET  /products/:id      [Product Service]
│  POST /orders   (checkout) ───► │──► POST /admin/products/:id/reduce [Product]
│  GET /profiles  ──────────────► │──► GET  /auth/profile       [Auth Service]
└─────────────────────────────────┘
```

---

## 🔑 JWT Authentication

Token JWT di-generate di **Auth Service** dan divalidasi di **semua service** menggunakan secret yang sama.

- **Secret Key:** `jomoro_secret_key_2026`
- **Expiry:** 1 hari (`1d`)
- **Payload:** `{ id: number, role: string }`

**Cara penggunaan di Swagger:**
1. Login via `POST /auth/login`
2. Copy `access_token` dari response
3. Klik tombol **Authorize 🔒** di Swagger UI
4. Paste token (tanpa prefix `Bearer`)

---

## 👤 Role System

| Role       | Akses                                                    |
|------------|----------------------------------------------------------|
| `CUSTOMER` | Cart, Order, Checkout, Profile, Public Products          |
| `ADMIN`    | Semua akses CUSTOMER + Create/Update/Delete Product      |

> Untuk mengubah role user menjadi ADMIN, jalankan query MySQL:
> ```sql
> UPDATE jomoro_auth.users SET role='ADMIN' WHERE email='your@email.com';
> ```

---

## 📋 Contoh Alur Penggunaan Lengkap

```bash
# 1. Register
POST /auth/register  →  { first_name, last_name, email, password }

# 2. Login
POST /auth/login  →  { access_token }

# 3. Lihat produk (publik, tanpa token)
GET /products

# 4. Tambah produk ke cart (butuh token)
POST /cart  →  { product_id, quantity }

# 5. Update quantity
POST /cart/:product_id/update  →  { quantity }

# 6. Checkout
POST /orders

# 7. Lihat riwayat order
GET /orders

# 8. Detail order
POST /orders/:id
```

---

## 🧪 Custom Validators

### `@IsStrongPassword()` — Auth Service
Memastikan password memenuhi kriteria:
- ✅ Panjang minimal 8 karakter
- ✅ Tidak mengandung spasi
- ✅ Minimal 2 angka (digit)

### `@IsValidDomain()` — Auth Service
Memastikan email memiliki domain yang valid:
- ✅ Format email yang benar
- ✅ Domain berakhiran: `.com`, `.net`, `.org`, atau `.id`

### `@MinWords(n)` — Product Service
Memastikan string mengandung minimal `n` kata:
- ✅ Digunakan pada field `name` produk (minimal 3 kata)

---

## 📂 Struktur File Per Service

```
auth-service/src/
├── auth/
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   ├── validators/
│   │   └── custom-validators.ts   ← @IsStrongPassword, @IsValidDomain
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt-auth.guard.ts
│   └── jwt.strategy.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── app.module.ts
└── main.ts

product-service/src/
├── auth/
│   ├── jwt-auth.guard.ts
│   ├── jwt.strategy.ts
│   ├── roles.decorator.ts         ← @Roles('ADMIN')
│   └── roles.guard.ts             ← RolesGuard
├── common/validators/
│   └── min-words.validator.ts     ← @MinWords(3)
├── dto/
│   ├── create-product.dto.ts
│   └── reduce-stock.dto.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── product.controller.ts
├── product.module.ts
├── product.service.ts
├── app.module.ts
└── main.ts

transaction-service/src/
├── auth/
│   ├── jwt-auth.guard.ts
│   └── jwt.strategy.ts
├── dto/
│   └── cart.dto.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── transaction.controller.ts
├── transaction.module.ts
├── transaction.service.ts
├── app.module.ts
└── main.ts
```

---

## ⚙️ Environment Variables

Setiap service memiliki file `.env` sendiri:

**`auth-service/.env`**
```env
DATABASE_URL="mysql://root:@localhost:3306/jomoro_auth"
PORT=3001
JWT_SECRET="jomoro_secret_key_2026"
```

**`product-service/.env`**
```env
DATABASE_URL="mysql://root:@localhost:3306/jomoro_product"
PORT=3002
JWT_SECRET="jomoro_secret_key_2026"
```

**`transaction-service/.env`**
```env
DATABASE_URL="mysql://root:@localhost:3306/jomoro_transaction"
PORT=3003
JWT_SECRET="jomoro_secret_key_2026"
PRODUCT_SERVICE_URL="http://localhost:3002"
AUTH_SERVICE_URL="http://localhost:3001"
```

---

*Dibuat dengan ❤️ untuk Jomoro Koffee POS System*
