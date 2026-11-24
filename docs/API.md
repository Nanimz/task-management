# Task Management API

## Daftar Isi

- [Pendahuluan](#pendahuluan)
- [Konvensi](#konvensi)
- [Auth](#auth)
  - [Register](#register)
  - [Login](#login)
  - [Refresh Token](#refresh-token)
  - [Logout](#logout)
- [Users](#users)
  - [Get Profile](#get-profile)
  - [Update Profile](#update-profile)
  - [Change Password](#change-password)
  - [Delete Account](#delete-account)

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
| 404    | Data tidak ditemukan                                     |
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

---

## Users

Semua endpoint di grup ini **wajib** memakai header `Authorization: Bearer <accessToken>`. Pengguna yang dimaksud adalah pemilik token, sehingga tidak ada `:id` di path.

### Get Profile

Mengambil profil pengguna yang sedang login.

`GET /api/v1/users/me`

**Auth:** Bearer token

**Response Sukses: 200 OK**

```json
{
  "success": true,
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

| Status | Kondisi                                        | Message                         |
| ------ | ---------------------------------------------- | ------------------------------- |
| 401    | Token tidak ada, tidak valid, atau kedaluwarsa | (menunggu middleware)           |
| 404    | Akun sudah dihapus tetapi token masih berlaku  | `User tidak ditemukan`          |
| 500    | Kesalahan server                               | `Terjadi kesalahan pada server` |

---

### Update Profile

Mengubah nama dan/atau email. Kirim hanya field yang ingin diubah.

`PATCH /api/v1/users/me`

**Auth:** Bearer token

**Request Body**

| Field | Tipe   | Wajib      | Keterangan                                                          |
| ----- | ------ | ---------- | ------------------------------------------------------------------- |
| name  | string | Salah satu | Tidak boleh kosong atau hanya spasi. Maks. 100 karakter             |
| email | string | Salah satu | Tidak boleh kosong atau hanya spasi. Harus unik. Maks. 255 karakter |

Minimal salah satu dari `name` atau `email` harus dikirim. Field yang tidak dikirim (atau bernilai `null`) tidak diubah.

**Contoh Request**

```json
{
  "name": "Budi S."
}
```

**Response Sukses: 200 OK**

```json
{
  "success": true,
  "message": "Profil berhasil diperbarui",
  "data": {
    "id": 1,
    "name": "Budi S.",
    "email": "budi@example.com",
    "created_at": "2026-11-24T08:00:00.000Z",
    "updated_at": "2026-11-25T09:30:00.000Z"
  }
}
```

**Response Error**

| Status | Kondisi                                                              | Message                                               |
| ------ | -------------------------------------------------------------------- | ----------------------------------------------------- |
| 400    | `name` dan `email` sama-sama tidak dikirim                           | `Minimal salah satu dari nama atau email harus diisi` |
| 400    | `name` kosong atau hanya spasi                                       | `name tidak boleh kosong`                             |
| 400    | `email` kosong atau hanya spasi                                      | `email tidak boleh kosong`                            |
| 401    | Token tidak ada, tidak valid, atau kedaluwarsa                       | (menunggu middleware)                                 |
| 404    | Akun tidak ditemukan                                                 | `User tidak ditemukan`                                |
| 409    | Email sudah dipakai pengguna lain                                    | `Email sudah digunakan`                               |
| 500    | `name` > 100 karakter, `email` > 255 karakter, atau kesalahan server | `Terjadi kesalahan di server`                         |

---

### Change Password

Mengganti password. Wajib menyertakan password lama.

`PATCH /api/v1/users/me/password`

**Auth:** Bearer token

**Request Body**

| Field       | Tipe   | Wajib | Keterangan         |
| ----------- | ------ | ----- | ------------------ |
| oldPassword | string | Ya    | Password saat ini  |
| newPassword | string | Ya    | Minimal 8 karakter |

**Contoh Request**

```json
{
  "oldPassword": "rahasia123",
  "newPassword": "passwordBaru456"
}
```

**Response Sukses: 200 OK**

```json
{
  "success": true,
  "message": "Password berhasil diperbarui"
}
```

**Catatan:** Refresh token dan access token yang sudah terbit **tidak dicabut** setelah password berubah. Keduanya tetap berlaku sampai kedaluwarsa atau dipakai.

**Response Error**

| Status | Kondisi                                        | Message                         |
| ------ | ---------------------------------------------- | ------------------------------- |
| 400    | `oldPassword` atau `newPassword` kosong        | `Password harus diisi`          |
| 400    | `oldPassword` atau `newPassword` bukan string  | `Password harus berupa teks`    |
| 400    | `newPassword` kurang dari 8 karakter           | `Password minimal 8 karakter`   |
| 400    | `oldPassword` tidak cocok                      | `Old password salah`            |
| 401    | Token tidak ada, tidak valid, atau kedaluwarsa | (menunggu middleware)           |
| 404    | Akun tidak ditemukan                           | `User tidak ditemukan`          |
| 500    | Kesalahan server                               | `Terjadi kesalahan pada server` |

---

### Delete Account

Menghapus akun secara permanen. Wajib menyertakan password untuk konfirmasi.

`DELETE /api/v1/users/me`

**Auth:** Bearer token

**Request Body**

| Field    | Tipe   | Wajib | Keterangan             |
| -------- | ------ | ----- | ---------------------- |
| password | string | Ya    | Password akun saat ini |

> Endpoint ini membaca `password` dari **request body** meskipun memakai method DELETE. Pastikan klien HTTP Anda mengirim body pada DELETE.

**Contoh Request**

```json
{
  "password": "rahasia123"
}
```

**Response Sukses: 200 OK**

```json
{
  "success": true,
  "message": "Data user berhasil dihapus",
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com"
  }
}
```

**Catatan:** Penghapusan akun ikut menghapus **semua task** dan **semua refresh token** milik pengguna tersebut (`ON DELETE CASCADE`). Tindakan ini tidak bisa dibatalkan.

**Response Error**

| Status | Kondisi                                        | Message                         |
| ------ | ---------------------------------------------- | ------------------------------- |
| 400    | `password` kosong                              | `Password harus diisi`          |
| 400    | `password` tidak cocok                         | `Password salah`                |
| 401    | Token tidak ada, tidak valid, atau kedaluwarsa | (menunggu middleware)           |
| 404    | Akun tidak ditemukan                           | `User tidak ditemukan`          |
| 500    | Kesalahan server                               | `Terjadi kesalahan pada server` |
