// Struktur tabel. Dijalankan otomatis lewat db.exec() saat koneksi dibuka.
// Pakai CREATE TABLE IF NOT EXISTS agar aman dijalankan ulang (idempoten).
//
// CATATAN: kolom DB memakai snake_case, sedangkan frontend lama memakai
// camelCase di localStorage (siswaId, namaSiswa). Butuh mapping di layer API nanti.

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS siswa (
    id    INTEGER PRIMARY KEY,
    nama  TEXT NOT NULL,
    kelas TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pemasukan (
    id         INTEGER PRIMARY KEY,
    tanggal    TEXT NOT NULL,
    siswa_id   INTEGER NOT NULL REFERENCES siswa(id),
    nama_siswa TEXT NOT NULL,
    keterangan TEXT NOT NULL,
    sumber     TEXT NOT NULL CHECK (sumber IN ('SPP', 'Kas', 'Donasi', 'Lainnya')),
    jumlah     INTEGER NOT NULL CHECK (jumlah > 0)
  );

  CREATE TABLE IF NOT EXISTS pengeluaran (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal    TEXT NOT NULL,
    keterangan TEXT NOT NULL,
    kategori   TEXT NOT NULL CHECK (kategori IN ('ATK/Perlengkapan', 'Kegiatan', 'Konsumsi', 'Lainnya')),
    jumlah     INTEGER NOT NULL CHECK (jumlah > 0),
    catatan    TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email         TEXT NOT NULL DEFAULT '',
    role          TEXT NOT NULL DEFAULT 'Admin',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Tabel transaksi generik untuk API /api/transactions.
  -- Tabel lama (pemasukan/pengeluaran) sengaja tidak diubah.
  CREATE TABLE IF NOT EXISTS transactions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    jenis      TEXT NOT NULL CHECK (jenis IN ('masuk', 'keluar')),
    deskripsi  TEXT NOT NULL,
    nominal    REAL NOT NULL CHECK (nominal > 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

module.exports = { SCHEMA_SQL };
