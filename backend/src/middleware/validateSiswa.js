// Dipakai oleh POST dan PUT. Menormalisasi input lalu menaruhnya di req.siswa
// supaya controller tidak perlu memvalidasi ulang.
function validateSiswa(req, res, next) {
    const errors = [];

    const nama =
        typeof req.body.nama === "string" ? req.body.nama.trim() : "";
    const kelas =
        typeof req.body.kelas === "string" ? req.body.kelas.trim() : "";

    if (nama === "") {
        errors.push("nama tidak boleh kosong");
    }

    if (kelas === "") {
        errors.push("kelas tidak boleh kosong");
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join("; ") });
    }

    req.siswa = { nama, kelas };
    next();
}

module.exports = validateSiswa;
