const JENIS_VALID = ["masuk", "keluar"];

// Dipakai oleh POST dan PUT. Menormalisasi input lalu menaruhnya di req.transaction
// supaya controller tidak perlu memvalidasi ulang.
function validateTransaction(req, res, next) {
    const errors = [];

    const jenis =
        typeof req.body.jenis === "string"
            ? req.body.jenis.trim().toLowerCase()
            : "";

    const nominal = Number(req.body.nominal);

    const deskripsi =
        typeof req.body.deskripsi === "string"
            ? req.body.deskripsi.trim()
            : "";

    if (!JENIS_VALID.includes(jenis)) {
        errors.push("jenis harus 'masuk' atau 'keluar'");
    }

    if (!Number.isFinite(nominal) || nominal <= 0) {
        errors.push("nominal harus berupa angka lebih dari 0");
    }

    if (deskripsi === "") {
        errors.push("deskripsi tidak boleh kosong");
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join("; ") });
    }

    req.transaction = { jenis, nominal, deskripsi };
    next();
}

module.exports = validateTransaction;
