const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const { DB_PATH } = require("../config/database");
const { SCHEMA_SQL } = require("./schema");

// Pastikan folder data/ ada sebelum SQLite mencoba membuat file database.
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Jalankan schema setiap kali aplikasi start; IF NOT EXISTS membuatnya idempoten.
db.exec(SCHEMA_SQL);

// Modul di-cache oleh Node -> satu koneksi dipakai ulang oleh seluruh aplikasi.
module.exports = db;
