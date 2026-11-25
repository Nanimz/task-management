# Task Management API

REST API untuk manajemen tugas (task) dengan autentikasi berbasis JWT. Setiap pengguna dapat mendaftar, masuk, lalu membuat, melihat, memfilter, mengubah, dan menghapus task miliknya sendiri.

![Node.js](https://img.shields.io/badge/Node.js-ESM-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Project](#struktur-project)
- [Memulai](#memulai)
- [Variabel Environment](#variabel-environment)
- [Skema Database](#skema-database)
- [Ringkasan Endpoint](#ringkasan-endpoint)
- [Dokumentasi API](#dokumentasi-api)
- [Cara Kerja Autentikasi](#cara-kerja-autentikasi)
- [Roadmap](#roadmap)

## Fitur

- Registrasi dan login pengguna dengan password ter-hash (bcrypt)
- Autentikasi JWT: access token berumur pendek dan refresh token sekali pakai (rotasi token)
- Manajemen profil: lihat, ubah nama/email, ganti password, hapus akun
- CRUD task dengan isolasi data per pengguna
- Filter task berdasarkan judul, status, dan prioritas
- Pengurutan (termasuk berdasarkan tingkat prioritas) dan pagination
- Refresh token disimpan dalam bentuk hash (SHA-256), bukan teks asli

## Teknologi

| Komponen    | Teknologi                    |
| ----------- | ---------------------------- |
| Runtime     | Node.js (ES Modules, `.mjs`) |
| Framework   | Express                      |
| Database    | PostgreSQL (`pg`)            |
| Autentikasi | `jsonwebtoken`, `bcrypt`     |

## Struktur Project

```
.
├── docs/
│   └── API.md                  # Dokumentasi lengkap endpoint
├── src/
│   ├── config/
│   │   └── database.mjs        # Koneksi PostgreSQL
│   ├── controllers/            # Validasi request dan format response
│   │   ├── auth.mjs
│   │   ├── user.mjs
│   │   └── task.mjs
│   ├── middlewares/
│   │   └── auth.mjs            # Verifikasi access token
│   ├── models/                 # Query SQL
│   │   ├── user.mjs
│   │   ├── task.mjs
│   │   └── refreshTokens.mjs
│   ├── routes/
│   │   ├── auth.mjs
│   │   ├── user.mjs
│   │   └── task.mjs
│   ├── service/                # Logika bisnis
│   │   ├── user.mjs
│   │   ├── task.mjs
│   │   └── refreshTokens.mjs
│   └── utils/
│       └── task.validator.mjs
├── .env.example
├── package.json
└── README.md
```

Alur request: `routes` → `middlewares` → `controllers` → `service` → `models` → database.

## Memulai

### Prasyarat

- [Node.js](https://nodejs.org/) (disarankan versi LTS terbaru)
- [PostgreSQL](https://www.postgresql.org/)
- npm

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/<username>/<nama-repo>.git
cd <nama-repo>

# 2. Install dependency
npm install

# 3. Salin file environment lalu isi nilainya
cp .env.example .env

# 4. Buat database dan jalankan skema (lihat bagian Skema Database)
createdb <nama_database>
psql -d <nama_database> -f docs/schema.sql

# 5. Jalankan server
npm start
```

Server berjalan di `http://localhost:<PORT>` dan seluruh endpoint berada di bawah `/api/v1`.

## Variabel Environment

Salin `.env.example` menjadi `.env` lalu sesuaikan:

```dotenv
# Server
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=task_management

# JWT
JWT_SECRET_KEY=ganti_dengan_string_acak_yang_panjang
JWT_EXPIRES_IN=20m
REFRESH_TOKEN_EXPIRES_DAYS=7
```

| Variabel                     | Keterangan                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `PORT`                       | Port server                                                                       |
| `DB_*`                       | Konfigurasi koneksi PostgreSQL (sesuaikan dengan `src/config/database.mjs`)       |
| `JWT_SECRET_KEY`             | Kunci rahasia untuk menandatangani access token. Gunakan string acak yang panjang |
| `JWT_EXPIRES_IN`             | Masa berlaku access token (contoh: `20m`)                                         |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Masa berlaku refresh token dalam hari                                             |

> **Penting:** jangan pernah meng-commit file `.env`. Pastikan `.env` sudah tercantum di `.gitignore`.

## Skema Database

<details>
<summary>Lihat skema SQL</summary>

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  due_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_tasks_status
    CHECK (status IN ('pending', 'in_progress', 'completed')),
  CONSTRAINT chk_tasks_priority
    CHECK (priority IN ('low', 'medium', 'high'))
);

CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

</details>

## Ringkasan Endpoint

Base URL: `http://localhost:<PORT>/api/v1`

### Auth

| Method | Endpoint         | Deskripsi                               | Auth |
| ------ | ---------------- | --------------------------------------- | ---- |
| POST   | `/auth/register` | Registrasi pengguna baru                | -    |
| POST   | `/auth/login`    | Login dan mendapatkan token             | -    |
| POST   | `/auth/refresh`  | Menukar refresh token dengan token baru | -    |
| POST   | `/auth/logout`   | Mencabut refresh token                  | -    |

### Users

| Method | Endpoint             | Deskripsi                | Auth   |
| ------ | -------------------- | ------------------------ | ------ |
| GET    | `/users/me`          | Lihat profil             | Bearer |
| PATCH  | `/users/me`          | Ubah nama dan/atau email | Bearer |
| PATCH  | `/users/me/password` | Ganti password           | Bearer |
| DELETE | `/users/me`          | Hapus akun               | Bearer |

### Tasks

| Method | Endpoint     | Deskripsi                              | Auth   |
| ------ | ------------ | -------------------------------------- | ------ |
| POST   | `/tasks`     | Buat task                              | Bearer |
| GET    | `/tasks`     | Daftar task (filter, sort, pagination) | Bearer |
| GET    | `/tasks/:id` | Detail task                            | Bearer |
| PATCH  | `/tasks/:id` | Ubah task                              | Bearer |
| DELETE | `/tasks/:id` | Hapus task                             | Bearer |

Contoh query untuk daftar task:

```
GET /api/v1/tasks?status=pending&priority=high&sortBy=due_date&order=asc&page=1&limit=10
```

## Dokumentasi API

Dokumentasi lengkap (request body, contoh response, dan daftar error tiap endpoint) tersedia di **[docs/API.md](docs/API.md)**.

## Cara Kerja Autentikasi

1. Login lewat `POST /auth/login` untuk mendapatkan `accessToken` dan `refreshToken`.
2. Kirim access token pada header setiap request ke endpoint yang dilindungi:

   ```
   Authorization: Bearer <accessToken>
   ```

3. Saat access token kedaluwarsa, panggil `POST /auth/refresh` dengan refresh token untuk mendapatkan pasangan token baru. Refresh token bersifat **sekali pakai**, jadi selalu simpan yang terbaru.
4. Panggil `POST /auth/logout` untuk mencabut refresh token.
