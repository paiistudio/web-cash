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
    return db.prepare("SELECT * FROM siswa WHERE id = ?").get(id);
}

// GET /api/siswa
function list(_req, res) {
    const data = db.prepare("SELECT * FROM siswa ORDER BY id DESC").all();
    res.status(200).json({ data, count: data.length });
}

// POST /api/siswa
function create(req, res) {
    const { nama, kelas } = req.siswa;

    const result = db
        .prepare("INSERT INTO siswa (nama, kelas) VALUES (?, ?)")
        .run(nama, kelas);

    const data = findById(Number(result.lastInsertRowid));

    res.status(201).json({
        message: "Siswa berhasil ditambahkan",
        data
    });
}

// PUT /api/siswa/:id
function update(req, res) {
    const id = parseId(req, res);
    if (id === null) return;

    if (!findById(id)) {
        return res
            .status(404)
            .json({ error: `Siswa dengan id ${id} tidak ditemukan` });
    }

    const { nama, kelas } = req.siswa;

    db.prepare("UPDATE siswa SET nama = ?, kelas = ? WHERE id = ?").run(
        nama,
        kelas,
        id
    );

    res.status(200).json({
        message: "Siswa berhasil diperbarui",
        data: findById(id)
    });
}

// DELETE /api/siswa/:id
function remove(req, res) {
    const id = parseId(req, res);
    if (id === null) return;

    if (!findById(id)) {
        return res
            .status(404)
            .json({ error: `Siswa dengan id ${id} tidak ditemukan` });
    }

    const referenced = db
        .prepare("SELECT 1 FROM pemasukan WHERE siswa_id = ? LIMIT 1")
        .get(id);

    if (referenced) {
        return res.status(409).json({
            error: `Siswa dengan id ${id} tidak dapat dihapus karena masih direferensikan oleh data pemasukan legacy`
        });
    }

    db.prepare("DELETE FROM siswa WHERE id = ?").run(id);

    res.status(200).json({ message: "Siswa berhasil dihapus" });
}

module.exports = { list, create, update, remove };
