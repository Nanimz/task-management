# Task Management API

## Daftar Isi

- [Pendahuluan](#pendahuluan)
- [Konvensi](#konvensi)
- [Auth](#auth)
  - [Register](#register)
  - [Login](#login)
  - [Refresh Token](#refresh-token)
  - [Logout](#logout)

---

## Pendahuluan

| Item        | Nilai                                                          |
| ----------- | -------------------------------------------------------------- |
| Base URL    | `http://localhost:<PORT>/api/v1`                               |
| Format data | JSON (`Content-Type: application/json`)                        |
| Autentikasi | Bearer token pada header `Authorization: Bearer <accessToken>` |

Endpoint di grup `/auth` tidak memerlukan access token. Endpoint di grup `/users` dan `/tasks` wajib memakainya.

### Alur Token

1. Panggil `POST /auth/login` untuk mendapatkan `accessToken` dan `refreshToken`.
2. Kirim `accessToken` di header `Authorization` untuk setiap request ke endpoint yang dilindungi.
3. Ketika `accessToken` kedaluwarsa, panggil `POST /auth/refresh` dengan `refreshToken` untuk mendapatkan pasangan token baru.
4. Panggil `POST /auth/logout` dengan `refreshToken` untuk mengakhiri sesi.

Catatan:

Catatan:

- `accessToken` adalah JWT dengan payload `id` dan `email`. Masa berlaku: **20 menit**.
- `refreshToken` adalah string acak (80 karakter hex). Masa berlaku: **7 hari**.
- `refreshToken` bersifat **sekali pakai**: setiap pemanggilan `/auth/refresh` menghapus token lama dan menerbitkan yang baru. Simpan selalu token terbaru.

---

## Konvensi

### Response Sukses

```json
{
  "success": true,
  "message": "Pesan sukses",
  "data": {}
}
```

`message` dan `data` bersifat opsional, tergantung endpoint (misalnya `/auth/refresh` hanya mengembalikan `data`, dan `/auth/logout` hanya `message`).

### Response Error

```json
{
  "success": false,
  "message": "Penjelasan error"
}
```

### Status Code yang Dipakai

| Status | Arti                                                     |
| ------ | -------------------------------------------------------- |
| 200    | Berhasil                                                 |
| 400    | Request tidak valid (field wajib kosong, dll.)           |
| 401    | Tidak terautentikasi / kredensial atau token tidak valid |
| 409    | Konflik data (misalnya email sudah terdaftar)            |
| 500    | Kesalahan server                                         |

---

## Auth

### Register

Membuat akun pengguna baru.

`POST /api/v1/auth/register`

**Auth:** Tidak diperlukan

**Request Body**

| Field    | Tipe   | Wajib | Keterangan                                                   |
| -------- | ------ | ----- | ------------------------------------------------------------ |
| name     | string | Ya    | Maks. 100 karakter                                           |
| email    | string | Ya    | Harus unik. Maks. 255 karakter                               |
| password | string | Ya    | Disimpan dalam bentuk hash (bcrypt). Tidak ada batas minimum |

**Contoh Request**

```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "rahasia123"
}
```

**Response Sukses: 200 OK**

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "created_at": "2026-11-24T08:00:00.000Z",
    "updated_at": "2026-11-24T08:00:00.000Z"
  }
}
```

**Response Error**

| Status | Kondisi                                 | Message                                   |
| ------ | --------------------------------------- | ----------------------------------------- |
| 400    | `name`, `email`, atau `password` kosong | `name, email, dan password wajib diisi !` |
| 409    | Email sudah terdaftar                   | `Email sudah terdaftar`                   |
| 500    | Kesalahan server                        | `Terjadi kesalahan pada server`           |

---

### Login

Memverifikasi kredensial dan menerbitkan access token serta refresh token.

`POST /api/v1/auth/login`

**Auth:** Tidak diperlukan

**Request Body**

| Field    | Tipe   | Wajib | Keterangan |
| -------- | ------ | ----- | ---------- |
| email    | string | Ya    |            |
| password | string | Ya    |            |

**Contoh Request**

```json
{
  "email": "budi@example.com",
  "password": "rahasia123"
}
```

**Response Sukses: 200 OK**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<refresh-token>"
  }
}
```

**Response Error**

| Status | Kondisi                                   | Message                           |
| ------ | ----------------------------------------- | --------------------------------- |
| 400    | `email` atau `password` kosong            | `Email dan password harus diisi!` |
| 401    | Email tidak terdaftar atau password salah | `Email atau password salah`       |
| 500    | Kesalahan server                          | `Terjadi kesalahan pada server`   |

---

### Refresh Token

Menukar refresh token yang masih berlaku dengan pasangan access token dan refresh token baru. Refresh token lama langsung tidak berlaku.

`POST /api/v1/auth/refresh`

**Auth:** Tidak memakai header Authorization (menggunakan `refreshToken` di body)

**Request Body**

| Field        | Tipe   | Wajib | Keterangan                                               |
| ------------ | ------ | ----- | -------------------------------------------------------- |
| refreshToken | string | Ya    | Refresh token terbaru dari login atau refresh sebelumnya |

**Contoh Request**

```json
{
  "refreshToken": "<refresh-token>"
}
```

**Response Sukses: 200 OK**

```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt-baru>",
    "refreshToken": "<refresh-token-baru>"
  }
}
```

**Response Error**

| Status | Kondisi                                                | Message                                     |
| ------ | ------------------------------------------------------ | ------------------------------------------- |
| 400    | `refreshToken` kosong                                  | `Refresh token wajib diisi`                 |
| 401    | Token tidak ditemukan, sudah dipakai, atau kedaluwarsa | `Refresh token tidak valid atau kadaluarsa` |
| 401    | User pemilik token sudah tidak ada                     | `User tidak ditemukan`                      |
| 500    | Kesalahan server                                       | `Terjadi kesalahan di server`               |

---

### Logout

Mencabut refresh token sehingga tidak bisa dipakai lagi.

`POST /api/v1/auth/logout`

**Auth:** Tidak memakai header Authorization (menggunakan `refreshToken` di body)

**Request Body**

| Field        | Tipe   | Wajib | Keterangan                       |
| ------------ | ------ | ----- | -------------------------------- |
| refreshToken | string | Ya    | Refresh token yang ingin dicabut |

**Contoh Request**

```json
{
  "refreshToken": "<refresh-token>"
}
```

**Response Sukses: 200 OK**

```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

**Catatan:**

- Endpoint ini tetap mengembalikan 200 meskipun token tidak ditemukan (idempotent).
- Access token yang sudah terbit tetap valid sampai kedaluwarsa karena JWT tidak disimpan di server.

**Response Error**

| Status | Kondisi               | Message                       |
| ------ | --------------------- | ----------------------------- |
| 401    | `refreshToken` kosong | `Refresh token wajib ada`     |
| 500    | Kesalahan server      | `Terjadi kesalahan di server` |
