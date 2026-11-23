const path = require("node:path");
const dotenv = require("dotenv");

// backend/ root dihitung dari lokasi file ini, BUKAN dari folder tempat perintah dijalankan.
// Ini membuat DB_PATH tetap benar baik dari root project maupun dari dalam backend/.
const ROOT_DIR = path.resolve(__dirname, "..", "..");

dotenv.config({ path: path.join(ROOT_DIR, ".env") });

const DB_PATH = path.resolve(
  ROOT_DIR,
  process.env.DB_PATH || "./data/kas.sqlite"
);

const PORT = Number(process.env.PORT) || 3000;

module.exports = { ROOT_DIR, DB_PATH, PORT };
