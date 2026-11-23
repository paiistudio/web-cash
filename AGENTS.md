# AGENTS.md — DOFTECH CASH

Aplikasi kas kelas. Frontend = static HTML/CSS/vanilla JS; backend REST API (Node.js + Express + SQLite) di `backend/`. Backend punya **CRUD `/api/transactions`** dan **CRUD `/api/siswa`**. Frontend transaksi dan daftar siswa sudah pakai API; dropdown siswa di pemasukan juga dari `/api/siswa`. Auth/pemasukan/pengeluaran endpoint **belum ada**.

## Batasan dari pemilik
- Aturan lama "jangan sentuh/ubah frontend" **sudah dicabut**. Frontend boleh diubah.
- Perapian terakhir hanya struktur folder + format kode; **logika dan tampilan tidak sengaja diubah**. Jangan hapus file tanpa konfirmasi.
- Urutan kerja: setup → config → koneksi → CRUD transactions → integrasi frontend (**selesai**). CRUD `/api/siswa` + integrasi frontend siswa/pemasukan dropdown (**selesai**). Auth/endpoint pemasukan/pengeluaran **belum**; jangan kerjakan login/auth dahulu.

## Struktur frontend
- `index.html` = entry point, tetap di root. Lima halaman lain ada di `halaman/` (`siswa`, `pemasukan`, `pengeluaran`, `login`, `profile`).
- `css/`: `style.css` (semua halaman + toast), `login.css`, `profile.css`. `js/`: `api.js` (shared fetch/format/toast), `dashboard.js`, `siswa.js`, `pemasukan.js`, `pengeluaran.js`.
- Aturan path: dari root → `css/...`, `js/...`, `halaman/...`; dari `halaman/` → `../css/...`, `../js/...`, `../index.html`. Sesama file di `halaman/` cukup nama file saja.
- Verifikasi cepat: `node --check js\<nama>.js` per file; cek semua `href`/`src` lokal masih resolve.
- Semua 6 HTML sudah punya `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. Jangan dihapus.
- RWD **CSS-only**, tanpa JS. Halaman dengan sidebar (`index.html`, `halaman/pemasukan.html`, `halaman/pengeluaran.html`, `halaman/siswa.html`) wajib punya 3 elemen ini di dalam `<body>` sebelum/ sesudah `<aside class="sidebar">`: `input#menu-toggle.menu-toggle`, `label.menu-button[for=menu-toggle]`, `label.menu-overlay[for=menu-toggle]`. Urutan sibling penting: `~ .sidebar` / `~ .menu-overlay` bergantung pada `input` sebagai sibling pertama. `login.html` & `profile.html` tidak punya sidebar ⇒ tidak pakai hamburger.

## Menjalankan
- Frontend: tanpa build/bundler/framework. **Serve root sebagai static HTTP** (mis. port 8080) agar fetch/CORS konsisten; backend harus jalan di `http://localhost:3000` (override: `window.DOFTECH_API_BASE` sebelum `api.js`).
- Backend: `cd backend` → `npm install` → `npm start` (`npm run dev` = `node --watch`, **auto-reload saat file diedit** — tidak perlu restart manual). Smoke test: `GET http://localhost:3000/api/health`.
- **PowerShell di mesin ini memblokir `npm.ps1` dan semua file `.ps1`** (execution policy). Pakai `cmd /c "npm ..."` / `npm.cmd`; untuk script pakai `cmd /c "powershell -ExecutionPolicy Bypass -File ..."`.
- Satu-satunya dependensi eksternal frontend: Font Awesome 6.5.2 via cdnjs (butuh internet untuk ikon).

## Struktur backend (`backend/`)
- `package.json` / `package-lock.json` — express 5, better-sqlite3 13, cors, dotenv. **CommonJS (`require`), bukan ESM.**
- `.env.example` = template; `.env` = lokal (diabaikan git). `.gitignore` juga mengabaikan `node_modules/` dan `data/*.sqlite*`.
- `src/config/database.js` — memuat `.env`, ekspor `PORT`, `DB_PATH`, `ROOT_DIR`. Path DB di-resolve relatif terhadap folder `backend/`, **bukan cwd**.
- `src/database/connection.js` — singleton koneksi better-sqlite3; buat folder `data/`, aktifkan WAL + foreign_keys, jalankan schema, export `db`.
- `src/database/schema.js` — 5 tabel (`siswa`, `pemasukan`, `pengeluaran`, `users`, `transactions`), `CREATE TABLE IF NOT EXISTS` (idempoten).
- `src/server.js` — Express app, `cors()` allow-all (dev only), `express.json()`, health check, mount `/api/transactions` dan `/api/siswa`, `listen`.
- `src/routes/transactions.js` + `controllers/transactionsController.js` + `middleware/validateTransaction.js` — CRUD transaksi; validasi menaruh hasil di `req.transaction`.
- `src/routes/siswa.js` + `controllers/siswaController.js` + `middleware/validateSiswa.js` — CRUD siswa; validasi menaruh hasil di `req.siswa`. Query SQLite **parameterized** (`?`).

## API yang tersedia (terverifikasi di port 3000)
- `GET /api/health` → 200 `{status:"ok",database:<path>,tables:[...]}`. Tanpa body/header.
- `GET /api/transactions` → 200 `{data:[...],count:n}` (urutan `id DESC`).
- `POST /api/transactions` → 201 `{message,data}`; body wajib `{jenis,deskripsi,nominal}`.
- `PUT /api/transactions/:id` → 200 `{message,data}`; **body lengkap** (semua field wajib, bukan patch).
- `DELETE /api/transactions/:id` → 200 `{message}`.
- Validasi transaksi: `jenis` case-insensitive → `masuk`/`keluar`; `nominal` angka > 0; `deskripsi` trim non-kosong. Error → 400 `{error:"..."}`. Id bukan integer positif → 400; id tidak ada → 404.
- `GET /api/siswa` → 200 `{data:[...],count:n}` (urutan `id DESC`).
- `POST /api/siswa` → 201 `{message,data}`; body wajib `{nama,kelas}` (string trim non-kosong).
- `PUT /api/siswa/:id` → 200 `{message,data}`; **body lengkap** (semua field wajib, bukan patch).
- `DELETE /api/siswa/:id` → 200 `{message}`. Jika siswa masih direferensikan oleh `pemasukan.siswa_id` (legacy), tolak dengan **409** `{error:"..."}`; jangan hapus data relasi.
- Validasi siswa: `nama`/`kelas` trim non-kosong → 400; id bukan integer positif → 400; id tidak ada → 404.
- Path lain (`/api/pemasukan`, `/api/pengeluaran`, `/api/auth`, `/`) masih **404**. Belum ada autentikasi.

## Konvensi data yang mudah terlewat
- Tabel `transactions` **terpisah** dari `pemasukan`/`pengeluaran` lama; tidak ada view/trigger. Data di tabel legacy **tidak** muncul di UI; semua UI transaksi sekarang memakai `/api/transactions`.
- `jenis` di DB lowercase (`masuk`/`keluar`); `nominal` `REAL`; `created_at` = `YYYY-MM-DD HH:MM:SS` (di JS: ganti spasi dengan `T` sebelum `new Date()`).
- Kontrak API hanya `{id, jenis, nominal, deskripsi, created_at}`. `deskripsi` satu string: pemasukan `catatan • sumber • siswa`, pengeluaran `keterangan • kategori • catatan`. Jangan menambah field tanpa mengubah backend.
- Form pemasukan: `#keterangan` = "Catatan Tambahan (Opsional)", kosong default, tidak wajib. Catatan kosong disimpan sebagai `-` di segmen pertama agar urutan tidak bergeser; catatan yang diisi ikut tersimpan di `deskripsi`.
- Edit pemasukan kini prefill sumber/siswa dan mempertahankan nilai lama bila select kosong. Jangan mengisi textarea dengan seluruh `deskripsi` seperti versi lama.
- `siswa.id` & `pemasukan.id` = `Date.now()` dari frontend (bukan autoincrement) agar data lama bisa dipindah; `pengeluaran.id` = AUTOINCREMENT (data lama memang tanpa id).
- Opsi sumber form pemasukan: `Kas Mingguan|Kas Bulanan|Usaha dana|Lainnya`; API tidak memvalidasinya (hanya masuk `deskripsi`). CHECK lama di tabel legacy `pemasukan` memakai `SPP|Kas|Donasi|Lainnya` dan tidak dipakai jalur API. Kategori pengeluaran: `ATK/Perlengkapan|Kegiatan|Konsumsi|Lainnya`.
- Dropdown "Nama Siswa" di `pemasukan.js` diisi dari `GET /api/siswa`; tanpa siswa di DB, form pemasukan menampilkan opsi kosong/disabled yang jelas. **Data transaksi dan data siswa tidak lagi ditulis ke localStorage.** (Jangan hapus `localStorage.dataSiswa` lama secara otomatis.)

## Wiring frontend (tidak terlihat dari nama file)
- `api.js` **harus** dimuat sebelum script halaman yang memakai API (`dashboard.js`, `pemasukan.js`, `pengeluaran.js`, `siswa.js`).
- Fungsi JS global, tanpa modul/import; handler dipanggil via `onclick` inline (`tampilkanForm`, `simpanPemasukan`, `simpanPengeluaran`, `tambahsiswa`, …). Ganti nama fungsi ⇒ sinkronkan HTML.
- Helper `api.js`: transaksi (`getTransactions/createTransaction/updateTransaction/deleteTransaction`), siswa (`getSiswa/createSiswa/updateSiswa/deleteSiswa`), `formatRupiah`, `formatTanggal`, `buildDeskripsi`, `showMessage`. `showMessage` membuat `#toastPesan` otomatis; gaya ada di `css/style.css`.
- Dashboard: 4 kolom tetap — `Nama←deskripsi`, `Tanggal←created_at`, `Jenis←jenis` badge `income/expense`, `Nominal←nominal` Rupiah. Total kas = pemasukan − pengeluaran.

## Responsive (RWD)
- Breakpoint di `css/style.css` (ditaruh di akhir file, setelah `.toast-error`): `max-width:1024px` = tablet, `max-width:600px` = smartphone, `max-width:380px` = penyesuaian kecil. Desktop >1024px tidak terkena aturan baru.
- Tablet: sidebar 200px (tetap kiri), kartu wrap 2 kolom (`flex: 1 1 calc(50% - 20px)`), input/tombol min-height 44px, tabel mulai scroll internal.
- HP: sidebar `position:fixed` off-canvas kiri (`left:-260px` → `0` saat `#menu-toggle:checked`), overlay hitam, hamburger 46px, kartu `display:grid; grid-template-columns:1fr`, input 46px, tombol full-width, toast full-width. `html,body { overflow-x:hidden }`.
- Tabel tidak pernah bikin page overflow: `.transactions` / `.income-table` = `overflow-x:auto`; `table { min-width:520px }`, `.income-table table { min-width:680px }`. `.content { min-width:0 }` global **wajib** agar flex child bisa menyusut.
- `login.css` & `profile.css` punya `@media max-width:768px` sendiri; RWD style.css tidak dimuat di sana. Jangan paksakan class style.css ke dua halaman itu.
- Perubahan RWD hanya HTML markup + CSS. Tidak ada perubahan JS, API, backend, atau DB.

## Verifikasi integrasi (34/34 lulus + 17/17 uji catatan opsional)
- Syntax: `node --check js\api.js`, `node --check js\dashboard.js`, `node --check js\pemasukan.js`, `node --check js\pengeluaran.js`.
- CORS/backend: `curl.exe -i http://localhost:3000/api/health` → `200` + `Access-Control-Allow-Origin: *`.
- Render awal cukup dicek dengan Chrome headless: `& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --virtual-time-budget=6000 --dump-dom http://localhost:8080/index.html`; baris & total harus sama dengan `GET /api/transactions`.
- `--dump-dom` **tidak** menguji klik form. Untuk POST/PUT/DELETE jalankan Chrome dengan `--remote-debugging-port=9222`, lalu lewat CDP `Runtime.evaluate` panggil `simpanPemasukan()`, `simpanPengeluaran()`, `editPemasukan(id)`, `editPengeluaran(id)`, `hapusPemasukan(id)`, `hapusPengeluaran(id)`. Sebelum hapus: `window.confirm = () => true`.
- Uji pemasukan butuh `localStorage.dataSiswa` agar dropdown "Nama Siswa" tidak kosong.
- Expected total dihitung dari **semua** transaksi `jenis` terkait di API, bukan hanya baris baru; jangan hardcode nominal form.
- Uji catatan opsional: label/placeholder/default kosong, simpan tanpa & dengan catatan, edit/hapus catatan, dan dashboard sinkron — 17/17 lulus lewat CDP.
- Uji RWD: 214/214 pemeriksaan lulus lewat CDP (`Emulation.setDeviceMetricsOverride`) untuk 6 halaman × lebar `375, 390, 430, 768, 1366`px. Cek: `documentElement.scrollWidth <= innerWidth`, tidak ada overlap antar kartu/header/filter, tidak ada elemen terpotong (abaikan elemen di dalam `.sidebar` off-canvas & area scroll tabel), hamburger toggles sidebar+overlay & navigasi, input form ≥44px, POST pemasukan/pengeluaran tetap jalan, tabel pakai scroll internal. Akses CDP: `chrome --headless=new --remote-debugging-port=9222 --remote-allow-origins=*`, lalu WebSocket ke `/json/list`.
- Data uji buatan lewat POST wajib dibersihkan lewat DELETE. Jangan hapus transaksi yang tidak dibuat pengujian; cek baseline sebelum menambah data uji.

## Fitur yang belum jalan (jangan diasumsikan berfungsi)
- Login/auth: `formLogin` tanpa handler; tombol Login/Logout tanpa aksi; `profile.html` statis. Jangan kerjakan dulu tanpa instruksi baru.
- Link mati: Home & tombol "Lihat semua" (`index.html`), "Pengeluaran" (`siswa.html`, `href="#"`).
- Endpoint `/api/pemasukan`, `/api/pengeluaran`, `/api/auth` belum ada; halaman pemasukan/pengeluaran masih menyimpan transaksi lewat `/api/transactions` (deskripsi berisi metadata), bukan endpoint khusus legacy.
- Search/filter dan edit/hapus transaksi **sudah jalan** via API. Tidak ada data dummy di `index.html` lagi.
