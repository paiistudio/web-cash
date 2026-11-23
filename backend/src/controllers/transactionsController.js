const db = require("../database/connection");

function parseId(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: "id harus berupa bilangan bulat positif" });
        return null;
    }

    return id;
}

function findById(id) {
    return db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);
}

// GET /api/transactions
function list(_req, res) {
    const data = db
        .prepare("SELECT * FROM transactions ORDER BY id DESC")
        .all();

    res.status(200).json({ data, count: data.length });
}

// POST /api/transactions
function create(req, res) {
    const { jenis, nominal, deskripsi } = req.transaction;

    const result = db
        .prepare(
            "INSERT INTO transactions (jenis, deskripsi, nominal) VALUES (?, ?, ?)"
        )
        .run(jenis, deskripsi, nominal);

    const data = findById(Number(result.lastInsertRowid));

    res.status(201).json({
        message: "Transaksi berhasil ditambahkan",
        data
    });
}

// PUT /api/transactions/:id
function update(req, res) {
    const id = parseId(req, res);
    if (id === null) return;

    if (!findById(id)) {
        return res
            .status(404)
            .json({ error: `Transaksi dengan id ${id} tidak ditemukan` });
    }

    const { jenis, nominal, deskripsi } = req.transaction;

    db.prepare(
        "UPDATE transactions SET jenis = ?, deskripsi = ?, nominal = ? WHERE id = ?"
    ).run(jenis, deskripsi, nominal, id);

    res.status(200).json({
        message: "Transaksi berhasil diperbarui",
        data: findById(id)
    });
}

// DELETE /api/transactions/:id
function remove(req, res) {
    const id = parseId(req, res);
    if (id === null) return;

    if (!findById(id)) {
        return res
            .status(404)
            .json({ error: `Transaksi dengan id ${id} tidak ditemukan` });
    }

    db.prepare("DELETE FROM transactions WHERE id = ?").run(id);

    res.status(200).json({ message: "Transaksi berhasil dihapus" });
}

module.exports = { list, create, update, remove };
