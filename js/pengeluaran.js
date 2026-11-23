console.log("FILE JS PENGELUARAN TERBACA");

// ==============================
// STATE (sumber data: API)
// ==============================

let dataTransaksi = [];
let idTransaksiEdit = null;

// ==============================
// FORM
// ==============================

function tampilkanForm() {
    document.getElementById("formPengeluaran").style.display = "block";
}

function tutupForm() {
    document.getElementById("formPengeluaran").style.display = "none";
}

function resetForm() {
    document.getElementById("tanggal").value = "";
    document.getElementById("keterangan").value = "";
    document.getElementById("kategori").value = "";
    document.getElementById("jumlah").value = "";
    document.getElementById("catatan").value = "";
    idTransaksiEdit = null;
    document.querySelector("#formPengeluaran h2").textContent = "Tambah Pengeluaran";
}

// ==============================
// PARSING DESKRIPSI (keterangan • kategori • catatan)
// ==============================

function parseDeskripsi(deskripsi) {
    let bagian = String(deskripsi || "")
        .split("•")
        .map(function (bagian) { return bagian.trim(); })
        .filter(function (bagian) { return bagian !== ""; });

    return {
        keterangan: bagian[0] || "-",
        kategori: bagian[1] || "-",
        catatan: bagian[2] || "-"
    };
}

// ==============================
// SIMPAN (POST / PUT)
// ==============================

async function simpanPengeluaran() {
    let tanggal = document.getElementById("tanggal").value;
    let keterangan = document.getElementById("keterangan").value.trim();
    let kategori = document.getElementById("kategori").value;
    let jumlah = document.getElementById("jumlah").value;
    let catatan = document.getElementById("catatan").value.trim();

    let modeEdit = idTransaksiEdit !== null;

    if (tanggal === "") {
        alert("Tanggal belum diisi!");
        document.getElementById("tanggal").focus();
        return;
    }

    if (keterangan === "") {
        alert("Keterangan belum diisi!");
        document.getElementById("keterangan").focus();
        return;
    }

    // Saat edit, kategori tidak bisa dipulihkan dari deskripsi gabungan.
    if (!modeEdit && kategori === "") {
        alert("Silakan pilih kategori!");
        document.getElementById("kategori").focus();
        return;
    }

    if (jumlah === "" || Number(jumlah) <= 0) {
        alert("Jumlah harus lebih dari 0!");
        document.getElementById("jumlah").focus();
        return;
    }

    let payload = {
        jenis: "keluar",
        nominal: Number(jumlah),
        deskripsi: buildDeskripsi(keterangan, kategori, catatan)
    };

    try {
        if (modeEdit) {
            await updateTransaction(idTransaksiEdit, payload);
            showMessage("Pengeluaran berhasil diperbarui", "sukses");
        } else {
            await createTransaction(payload);
            showMessage("Pengeluaran berhasil disimpan", "sukses");
        }

        resetForm();
        tutupForm();
        await muatDataPengeluaran();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// ==============================
// EDIT & HAPUS
// ==============================

function editPengeluaran(id) {
    let transaksi = dataTransaksi.find(function (item) {
        return item.id === id;
    });

    if (!transaksi) {
        showMessage("Data pengeluaran tidak ditemukan", "error");
        return;
    }

    idTransaksiEdit = id;
    document.querySelector("#formPengeluaran h2").textContent = "Edit Pengeluaran";

    document.getElementById("tanggal").value = String(transaksi.created_at || "").slice(0, 10);
    document.getElementById("keterangan").value = transaksi.deskripsi;
    document.getElementById("jumlah").value = transaksi.nominal;

    tampilkanForm();
    document.getElementById("keterangan").focus();
}

async function hapusPengeluaran(id) {
    if (!confirm("Yakin ingin menghapus transaksi pengeluaran ini?")) {
        return;
    }

    try {
        await deleteTransaction(id);
        showMessage("Pengeluaran berhasil dihapus", "sukses");
        await muatDataPengeluaran();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// ==============================
// TABEL & RINGKASAN
// ==============================

function tampilkanPengeluaran() {
    let tabel = document.getElementById("tabelPengeluaran");
    tabel.innerHTML = "";

    let cari = document.getElementById("cariPengeluaran").value.trim().toLowerCase();
    let kategoriFilter = document.getElementById("filterKategoriPengeluaran").value;

    let data = dataTransaksi.filter(function (transaksi) {
        let info = parseDeskripsi(transaksi.deskripsi);
        let cocokCari = cari === "" || String(transaksi.deskripsi).toLowerCase().includes(cari);
        let cocokKategori = kategoriFilter === "" || info.kategori === kategoriFilter;
        return cocokCari && cocokKategori;
    });

    if (data.length === 0) {
        let baris = tabel.insertRow();
        let cell = baris.insertCell(0);
        cell.colSpan = 6;
        cell.textContent = "Belum ada transaksi pengeluaran.";
        cell.style.textAlign = "center";
        return;
    }

    data.forEach(function (transaksi) {
        let info = parseDeskripsi(transaksi.deskripsi);
        let baris = tabel.insertRow();

        baris.insertCell(0).textContent = formatTanggal(transaksi.created_at);
        baris.insertCell(1).textContent = info.keterangan;
        baris.insertCell(2).textContent = info.kategori;
        baris.insertCell(3).textContent = formatRupiah(transaksi.nominal);
        baris.insertCell(4).textContent = info.catatan;

        let cellAksi = baris.insertCell(5);

        let tombolEdit = document.createElement("button");
        tombolEdit.textContent = "Edit";
        tombolEdit.classList.add("edit-btn");
        tombolEdit.onclick = function () { editPengeluaran(transaksi.id); };

        let tombolHapus = document.createElement("button");
        tombolHapus.textContent = "Hapus";
        tombolHapus.classList.add("hapus-btn");
        tombolHapus.onclick = function () { hapusPengeluaran(transaksi.id); };

        cellAksi.appendChild(tombolEdit);
        cellAksi.appendChild(tombolHapus);
    });
}

function updatePengeluaran() {
    let total = 0;

    dataTransaksi.forEach(function (transaksi) {
        total += Number(transaksi.nominal);
    });

    document.getElementById("totalPengeluaran").textContent = formatRupiah(total);
    document.getElementById("jumlahTransaksi").textContent =
        dataTransaksi.length + " Transaksi";
}

async function muatDataPengeluaran() {
    try {
        let hasil = await getTransactions();
        dataTransaksi = hasil.data.filter(function (item) {
            return item.jenis === "keluar";
        });
        tampilkanPengeluaran();
        updatePengeluaran();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// ==============================
// EVENT & LOAD
// ==============================

document.getElementById("formPengeluaran").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        simpanPengeluaran();
    }
});

document.getElementById("cariPengeluaran").addEventListener("input", tampilkanPengeluaran);
document.getElementById("filterKategoriPengeluaran").addEventListener("change", tampilkanPengeluaran);

document.addEventListener("DOMContentLoaded", muatDataPengeluaran);
