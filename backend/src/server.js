const express = require("express");
const cors = require("cors");

const { PORT, DB_PATH } = require("./config/database");
const db = require("./database/connection");
const transactionsRoutes = require("./routes/transactions");
const siswaRoutes = require("./routes/siswa");

const app = express();

app.use(cors());
app.use(express.json());

// Smoke test: memastikan server hidup DAN koneksi database berhasil.
app.get("/api/health", (_req, res) => {
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all()
    .map((row) => row.name);

  res.json({ status: "ok", database: DB_PATH, tables });
});

app.use("/api/transactions", transactionsRoutes);
app.use("/api/siswa", siswaRoutes);

// TODO tahap berikutnya: mount /api/auth, /api/pemasukan, /api/pengeluaran.

app.listen(PORT, () => {
  console.log(`DOFTECH CASH API berjalan di http://localhost:${PORT}`);
  console.log(`Database: ${DB_PATH}`);
});
