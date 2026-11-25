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
- [Tasks](#tasks)
  - [Create Task](#create-task)
  - [Get Tasks](#get-tasks)
  - [Get Task by ID](#get-task-by-id)
  - [Update Task](#update-task)
  - [Delete Task](#delete-task)

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
| 201    | Resource berhasil dibuat                                 |
| 400    | Request tidak valid (field wajib kosong, dll.)           |
| 401    | Tidak terautentikasi / kredensial atau token tidak valid |
| 404    | Data tidak ditemukan                                     |
| 409    | Konflik data (misalnya email sudah terdaftar)            |
| 500    | Kesalahan server                                         |

### Error Autentikasi

Endpoint di grup `/users` dan `/tasks` dilindungi middleware autentikasi. Jika gagal, response-nya **tidak memiliki field `success`**:

```json
{
  "message": "Token sudah kadaluarsa"
}
```

| Status | Kondisi                                                                                            | Message                  |
| ------ | -------------------------------------------------------------------------------------------------- | ------------------------ |
| 401    | Header `Authorization` tidak ada, atau tidak diawali `Bearer ` (huruf B besar, diikuti satu spasi) | `Token tidak ditemukan`  |
| 401    | Access token sudah kedaluwarsa (masa berlaku 20 menit)                                             | `Token sudah kadaluarsa` |
| 401    | Token rusak, signature salah, atau kosong                                                          | `Token tidak valid`      |

Jika menerima `Token sudah kadaluarsa`, panggil `POST /auth/refresh` untuk mendapatkan access token baru.

Di tabel Response Error tiap endpoint, kondisi ini ditulis sebagai satu baris yang merujuk ke bagian ini.

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

| Status | Kondisi                                       | Message                                       |
| ------ | --------------------------------------------- | --------------------------------------------- |
| 401    | Autentikasi gagal                             | Lihat [Error Autentikasi](#error-autentikasi) |
| 404    | Akun sudah dihapus tetapi token masih berlaku | `User tidak ditemukan`                        |
| 500    | Kesalahan server                              | `Terjadi kesalahan pada server`               |

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
| 401    | Autentikasi gagal                                                    | Lihat [Error Autentikasi](#error-autentikasi)         |
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

| Status | Kondisi                                       | Message                                       |
| ------ | --------------------------------------------- | --------------------------------------------- |
| 400    | `oldPassword` atau `newPassword` kosong       | `Password harus diisi`                        |
| 400    | `oldPassword` atau `newPassword` bukan string | `Password harus berupa teks`                  |
| 400    | `newPassword` kurang dari 8 karakter          | `Password minimal 8 karakter`                 |
| 400    | `oldPassword` tidak cocok                     | `Old password salah`                          |
| 401    | Autentikasi gagal                             | Lihat [Error Autentikasi](#error-autentikasi) |
| 404    | Akun tidak ditemukan                          | `User tidak ditemukan`                        |
| 500    | Kesalahan server                              | `Terjadi kesalahan pada server`               |

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

| Status | Kondisi                | Message                                       |
| ------ | ---------------------- | --------------------------------------------- |
| 400    | `password` kosong      | `Password harus diisi`                        |
| 400    | `password` tidak cocok | `Password salah`                              |
| 401    | Autentikasi gagal      | Lihat [Error Autentikasi](#error-autentikasi) |
| 404    | Akun tidak ditemukan   | `User tidak ditemukan`                        |
| 500    | Kesalahan server       | `Terjadi kesalahan pada server`               |

---

## Tasks

Semua endpoint di grup ini **wajib** memakai header `Authorization: Bearer <accessToken>`. Setiap pengguna hanya bisa mengakses task miliknya sendiri. Mengakses task milik pengguna lain menghasilkan `404`, sama seperti task yang tidak ada.

Nilai yang valid untuk `status`, `priority`, dan `due_date` dijelaskan di [Lampiran](#lampiran).

### Create Task

Membuat task baru untuk pengguna yang sedang login.

`POST /api/v1/tasks`

**Auth:** Bearer token

**Request Body**

| Field       | Tipe   | Wajib | Keterangan                                                                                        |
| ----------- | ------ | ----- | ------------------------------------------------------------------------------------------------- |
| title       | string | Ya    | Tidak boleh kosong atau hanya spasi. Maks. 150 karakter (setelah spasi di awal dan akhir dibuang) |
| description | string | Tidak | Teks bebas                                                                                        |
| status      | string | Tidak | `pending`, `in_progress`, atau `completed`. Default `pending`                                     |
| priority    | string | Tidak | `low`, `medium`, atau `high`. Default `medium`                                                    |
| due_date    | string | Ya    | Format `YYYY-MM-DD`. Tidak boleh sebelum hari ini                                                 |

**Contoh Request**

```json
{
  "title": "Menulis dokumentasi API",
  "description": "Selesaikan API.md bagian Tasks",
  "priority": "high",
  "due_date": "2026-12-01"
}
```

**Response Sukses: 201 Created**

```json
{
  "success": true,
  "message": "Task berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Menulis dokumentasi API",
    "description": "Selesaikan API.md bagian Tasks",
    "status": "pending",
    "priority": "high",
    "due_date": "2026-12-01",
    "created_at": "2026-11-25T09:00:00.000Z",
    "updated_at": "2026-11-25T09:00:00.000Z"
  }
}
```

**Response Error**

Hanya satu error yang dikembalikan per request. Urutan pengecekan: `title`, `status`, `priority`, `due_date`.

| Status | Kondisi                                                                                                        | Message                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 400    | `title` bukan string, kosong, atau hanya spasi                                                                 | `Title harus berupa string dan harus diisi`                      |
| 400    | `title` lebih dari 150 karakter                                                                                | `Title tidak boleh lebih dari 150 karakter`                      |
| 400    | `status` bukan salah satu nilai yang valid                                                                     | `Status harus salah satu dari:  pending, in_progress, completed` |
| 400    | `priority` bukan salah satu nilai yang valid                                                                   | `Prioritas harus salah satu dari: low, medium, high`             |
| 400    | `due_date` tidak ada atau formatnya salah                                                                      | `Due date wajib diisi dan harus berformat YYYY-MM-DD`            |
| 400    | `due_date` sebelum hari ini                                                                                    | `Deadline tidak boleh di masa lalu`                              |
| 401    | Autentikasi gagal                                                                                              | Lihat [Error Autentikasi](#error-autentikasi)                    |
| 500    | Tanggal tidak ada di kalender (misalnya `2026-02-31`), akun pemilik token sudah dihapus, atau kesalahan server | `Terjadi kesalahan pada server`                                  |

---

### Get Tasks

Mengambil daftar task milik pengguna, dengan filter, pengurutan, dan pagination.

`GET /api/v1/tasks`

**Auth:** Bearer token

**Query Parameters**

Semua parameter bersifat opsional. Filter digabung dengan logika AND.

| Parameter | Tipe    | Default      | Keterangan                                                                      |
| --------- | ------- | ------------ | ------------------------------------------------------------------------------- |
| title     | string  | -            | Pencarian sebagian pada judul, tidak peka huruf besar-kecil. Tidak boleh kosong |
| status    | string  | -            | `pending`, `in_progress`, atau `completed`                                      |
| priority  | string  | -            | `low`, `medium`, atau `high`                                                    |
| sortBy    | string  | `created_at` | `created_at`, `updated_at`, `due_date`, `title`, atau `priority`                |
| order     | string  | `desc`       | `asc` atau `desc`                                                               |
| page      | integer | `1`          | Bilangan bulat >= 1                                                             |
| limit     | integer | `10`         | Bilangan bulat 1-100                                                            |

Catatan pengurutan:

- `sortBy=priority` mengurutkan berdasarkan tingkat urgensi (`low` < `medium` < `high`), bukan alfabet. `order=desc` menempatkan `high` paling atas.
- Jika nilai pengurutan sama, task diurutkan menurut `id` naik.

**Contoh Request**

```
GET /api/v1/tasks?status=pending&priority=high&sortBy=due_date&order=asc&page=1&limit=10
```

**Response Sukses: 200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Menulis dokumentasi API",
      "description": "Selesaikan API.md bagian Tasks",
      "status": "pending",
      "priority": "high",
      "due_date": "2026-12-01",
      "created_at": "2026-11-25T09:00:00.000Z",
      "updated_at": "2026-11-25T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

**Catatan:**

- `total` adalah jumlah task yang cocok dengan filter (bukan jumlah task di halaman ini).
- Jika tidak ada task yang cocok, `data` berupa array kosong, `total` dan `totalPages` bernilai `0`.
- Meminta `page` di luar rentang tetap mengembalikan 200 dengan `data` kosong.

**Response Error**

| Status | Kondisi                            | Message                                                                                  |
| ------ | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| 400    | `title` bukan string atau kosong   | `Title harus berupa teks dan tidak boleh kosong`                                         |
| 400    | `status` tidak valid               | `Status harus berupa salah satu dari: pending, in_progress, completed`                   |
| 400    | `priority` tidak valid             | `Priority harus berupa salah satu dari: low, medium, high`                               |
| 400    | `sortBy` tidak valid               | `SortBy harus berupa salah satu dari: created_at, updated_at, due_date, title, priority` |
| 400    | `order` bukan `asc` atau `desc`    | `Order harus berupa asc atau desc`                                                       |
| 400    | `page` bukan bilangan bulat >= 1   | `Page harus bilangan bulat >= 1`                                                         |
| 400    | `limit` bukan bilangan bulat 1-100 | `Limit harus bilangan bulat 1-100`                                                       |
| 401    | Autentikasi gagal                  | Lihat [Error Autentikasi](#error-autentikasi)                                            |
| 500    | Kesalahan server                   | `Terjadi kesalahan pada server`                                                          |

---

### Get Task by ID

Mengambil satu task milik pengguna.

`GET /api/v1/tasks/:id`

**Auth:** Bearer token

**Path Parameters**

| Parameter | Tipe    | Keterangan                      |
| --------- | ------- | ------------------------------- |
| id        | integer | ID task, bilangan bulat positif |

**Response Sukses: 200 OK**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Menulis dokumentasi API",
    "description": "Selesaikan API.md bagian Tasks",
    "status": "pending",
    "priority": "high",
    "due_date": "2026-12-01",
    "created_at": "2026-11-25T09:00:00.000Z",
    "updated_at": "2026-11-25T09:00:00.000Z"
  }
}
```

**Response Error**

| Status | Kondisi                                  | Message                                       |
| ------ | ---------------------------------------- | --------------------------------------------- |
| 400    | `id` bukan bilangan bulat positif        | `ID task tidak valid`                         |
| 401    | Autentikasi gagal                        | Lihat [Error Autentikasi](#error-autentikasi) |
| 404    | Task tidak ada, atau milik pengguna lain | `Task tidak ditemukan`                        |
| 500    | Kesalahan server                         | `Terjadi kesalahan pada server`               |

---

### Update Task

Mengubah sebagian atau seluruh field task. Kirim hanya field yang ingin diubah.

`PATCH /api/v1/tasks/:id`

**Auth:** Bearer token

**Path Parameters**

| Parameter | Tipe    | Keterangan                      |
| --------- | ------- | ------------------------------- |
| id        | integer | ID task, bilangan bulat positif |

**Request Body**

Minimal satu field harus dikirim. Field yang tidak dikirim (atau bernilai `null`) tidak diubah.

| Field       | Tipe   | Wajib | Keterangan                                              |
| ----------- | ------ | ----- | ------------------------------------------------------- |
| title       | string | Tidak | Tidak boleh kosong atau hanya spasi. Maks. 150 karakter |
| description | string | Tidak | Kirim `""` untuk mengosongkan. `null` diabaikan         |
| status      | string | Tidak | `pending`, `in_progress`, atau `completed`              |
| priority    | string | Tidak | `low`, `medium`, atau `high`                            |
| due_date    | string | Tidak | Format `YYYY-MM-DD`                                     |

Catatan: berbeda dengan Create Task, `due_date` di endpoint ini **boleh** diisi tanggal yang sudah lewat.

**Contoh Request**

```json
{
  "status": "in_progress"
}
```

**Response Sukses: 200 OK**

```json
{
  "success": true,
  "message": "Task berhasil diupdate",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Menulis dokumentasi API",
    "description": "Selesaikan API.md bagian Tasks",
    "status": "in_progress",
    "priority": "high",
    "due_date": "2026-12-01",
    "created_at": "2026-11-25T09:00:00.000Z",
    "updated_at": "2026-11-25T10:15:00.000Z"
  }
}
```

**Response Error**

| Status | Kondisi                                                                     | Message                                                          |
| ------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 400    | Tidak ada satu pun field yang dikirim                                       | `Tidak ada data yang diubah`                                     |
| 400    | `id` bukan bilangan bulat positif                                           | `ID task tidak valid`                                            |
| 400    | `title` kosong, hanya spasi, atau bukan string                              | `Title harus berupa string dan harus diisi`                      |
| 400    | `title` lebih dari 150 karakter                                             | `Title tidak boleh lebih dari 150 karakter`                      |
| 400    | `status` tidak valid                                                        | `Status harus salah satu dari:  pending, in_progress, completed` |
| 400    | `priority` tidak valid                                                      | `Prioritas harus salah satu dari: low, medium, high`             |
| 400    | `due_date` formatnya salah                                                  | `Due date wajib diisi dan harus berformat YYYY-MM-DD`            |
| 401    | Autentikasi gagal                                                           | Lihat [Error Autentikasi](#error-autentikasi)                    |
| 404    | Task tidak ada, atau milik pengguna lain                                    | `Task tidak ditemukan`                                           |
| 500    | Tanggal tidak ada di kalender (misalnya `2026-02-31`) atau kesalahan server | `Terjadi kesalahan pada server`                                  |

---

### Delete Task

Menghapus task secara permanen.

`DELETE /api/v1/tasks/:id`

**Auth:** Bearer token

**Path Parameters**

| Parameter | Tipe    | Keterangan                      |
| --------- | ------- | ------------------------------- |
| id        | integer | ID task, bilangan bulat positif |

**Response Sukses: 200 OK**

Mengembalikan task yang baru dihapus. Response ini tidak memiliki field `message`.

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Menulis dokumentasi API",
    "description": "Selesaikan API.md bagian Tasks",
    "status": "in_progress",
    "priority": "high",
    "due_date": "2026-12-01",
    "created_at": "2026-11-25T09:00:00.000Z",
    "updated_at": "2026-11-25T10:15:00.000Z"
  }
}
```

**Response Error**

| Status | Kondisi                                  | Message                                       |
| ------ | ---------------------------------------- | --------------------------------------------- |
| 400    | `id` bukan bilangan bulat positif        | `Task ID tidak valid`                         |
| 401    | Autentikasi gagal                        | Lihat [Error Autentikasi](#error-autentikasi) |
| 404    | Task tidak ada, atau milik pengguna lain | `Task tidak ditemukan`                        |
| 500    | Kesalahan server                         | `Terjadi kesalahan pada server`               |

---

## Lampiran

### Model User

| Field      | Tipe              | Keterangan               |
| ---------- | ----------------- | ------------------------ |
| id         | integer           | Auto-increment           |
| name       | string            | Maks. 100 karakter       |
| email      | string            | Unik, maks. 255 karakter |
| created_at | string (ISO 8601) | Waktu dibuat             |
| updated_at | string (ISO 8601) | Waktu terakhir diubah    |

Field `password` tidak pernah dikembalikan di response.

### Model Task

| Field       | Tipe              | Keterangan                             |
| ----------- | ----------------- | -------------------------------------- |
| id          | integer           | Auto-increment                         |
| user_id     | integer           | ID pemilik task                        |
| title       | string            | Maks. 150 karakter                     |
| description | string \| null    | Teks bebas                             |
| status      | string            | Lihat enum di bawah. Default `pending` |
| priority    | string            | Lihat enum di bawah. Default `medium`  |
| due_date    | string            | Tanggal `YYYY-MM-DD`                   |
| created_at  | string (ISO 8601) | Waktu dibuat                           |
| updated_at  | string (ISO 8601) | Waktu terakhir diubah                  |

### Enum

| Field              | Nilai                                                       |
| ------------------ | ----------------------------------------------------------- |
| status             | `pending`, `in_progress`, `completed`                       |
| priority           | `low`, `medium`, `high`                                     |
| sortBy (Get Tasks) | `created_at`, `updated_at`, `due_date`, `title`, `priority` |
