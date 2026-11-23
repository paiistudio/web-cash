console.log("FILE JS PEMASUKAN TERBACA");

// ========================================
// STATE (sumber data: API)
// ========================================

let dataTransaksi = [];
let idTransaksiEdit = null;

// ========================================
// FORM
// ========================================

function tampilkanForm() {
    document.getElementById("formPemasukan").style.display = "block";
}

function tutupForm() {
    document.getElementById("formPemasukan").style.display = "none";
}

function resetForm() {
    document.getElementById("tanggal").value = "";
    document.getElementById("namaSiswa").value = "";
    document.getElementById("keterangan").value = "";
    document.getElementById("sumber").value = "";
    document.getElementById("jumlah").value = "";
    idTransaksiEdit = null;
    document.querySelector("#formPemasukan h2").textContent = "Tambah Pemasukan";
}

// ========================================
// DROPDOWN SISWA (sumber: API /api/siswa)
// ========================================

async function tampilkanDaftarSiswa() {
    let select = document.getElementById("namaSiswa");
    select.innerHTML = '<option value="">Pilih Nama Siswa</option>';

    try {
        let hasil = await getSiswa();
        let dataSiswa = hasil.data || [];

        if (dataSiswa.length === 0) {
            let option = document.createElement("option");
            option.value = "";
            option.textContent = "Belum ada data siswa";
            option.disabled = true;
            select.appendChild(option);
            return;
        }

        dataSiswa.forEach(function (siswa) {
            let option = document.createElement("option");
            option.value = siswa.id;
            option.textContent = siswa.nama;
            select.appendChild(option);
        });
    } catch (error) {
        let option = document.createElement("option");
        option.value = "";
        option.textContent = "Gagal memuat data siswa";
        option.disabled = true;
        select.appendChild(option);
        showMessage(error.message, "error");
    }
}

// ========================================
// PARSING DESKRIPSI (catatan • sumber • siswa)
// ========================================

function parseDeskripsi(deskripsi) {
    let bagian = String(deskripsi || "")
        .split("•")
        .map(function (bagian) { return bagian.trim(); })
        .filter(function (bagian) { return bagian !== ""; });

    return {
        keterangan: bagian[0] || "-",
        sumber: bagian[1] || "-",
        siswa: bagian[2] || "-"
    };
}

// ========================================
// SIMPAN (POST saat tambah, PUT saat edit)
// ========================================

async function simpanPemasukan() {
    let tanggal = document.getElementById("tanggal").value;
    let namaSiswa = document.getElementById("namaSiswa").value;
    let catatan = document.getElementById("keterangan").value.trim();
    let sumber = document.getElementById("sumber").value;
    let jumlah = document.getElementById("jumlah").value;

    let modeEdit = idTransaksiEdit !== null;

    if (tanggal === "") {
        alert("Tanggal belum diisi!");
        document.getElementById("tanggal").focus();
        return;
    }

    // Saat edit, sumber & siswa tidak wajib dipilih ulang (nilai lama dipertahankan).
    if (!modeEdit && namaSiswa === "") {
        alert("Silakan pilih nama siswa!");
        document.getElementById("namaSiswa").focus();
        return;
    }

    if (!modeEdit && sumber === "") {
        alert("Silakan pilih sumber pemasukan!");
        document.getElementById("sumber").focus();
        return;
    }

    if (jumlah === "" || Number(jumlah) <= 0) {
        alert("Jumlah harus lebih dari 0!");
        document.getElementById("jumlah").focus();
        return;
    }

    let select = document.getElementById("namaSiswa");
    let siswaText = select.options[select.selectedIndex]
        ? select.options[select.selectedIndex].text
        : "";
    if (siswaText === "Pilih Nama Siswa" || siswaText === "Belum ada data siswa") {
        siswaText = "";
    }

    // Saat edit, sumber & siswa yang tidak dipilih ulang tetap dipertahankan
    // dari deskripsi lama agar tidak hilang hanya karena catatan diubah.
    let infoLama = { sumber: "", siswa: "" };
    if (modeEdit) {
        let lama = dataTransaksi.find(function (item) { return item.id === idTransaksiEdit; });
        if (lama) infoLama = parseDeskripsi(lama.deskripsi);
    }

    let sumberFinal = sumber || (infoLama.sumber === "-" ? "" : infoLama.sumber);
    let siswaFinal = siswaText || (infoLama.siswa === "-" ? "" : infoLama.siswa);

    let payload = {
        jenis: "masuk",
        nominal: Number(jumlah),
        deskripsi: buildDeskripsi(catatan || "-", sumberFinal, siswaFinal)
    };

    try {
        if (modeEdit) {
            await updateTransaction(idTransaksiEdit, payload);
            showMessage("Pemasukan berhasil diperbarui", "sukses");
        } else {
            await createTransaction(payload);
            showMessage("Pemasukan berhasil disimpan", "sukses");
        }

        resetForm();
        tutupForm();
        await muatDataPemasukan();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// ========================================
// EDIT & HAPUS
// ========================================

function editPemasukan(id) {
    let transaksi = dataTransaksi.find(function (item) {
        return item.id === id;
    });

    if (!transaksi) {
        showMessage("Data pemasukan tidak ditemukan", "error");
        return;
    }

    idTransaksiEdit = id;
    document.querySelector("#formPemasukan h2").textContent = "Edit Pemasukan";

    let info = parseDeskripsi(transaksi.deskripsi);
    let catatanLama = info.keterangan === "-" ? "" : info.keterangan;

    document.getElementById("tanggal").value = String(transaksi.created_at || "").slice(0, 10);
    document.getElementById("keterangan").value = catatanLama;
    document.getElementById("jumlah").value = transaksi.nominal;

    // Prefill pilihan lama bila masih tersedia. Jika tidak, payload edit tetap
    // mempertahankan sumber/siswa dari deskripsi lama.
    let sumberSelect = document.getElementById("sumber");
    Array.prototype.forEach.call(sumberSelect.options, function (option) {
        if (option.value === info.sumber) sumberSelect.value = info.sumber;
    });

    let siswaSelect = document.getElementById("namaSiswa");
    Array.prototype.forEach.call(siswaSelect.options, function (option) {
        if (option.text === info.siswa) siswaSelect.value = option.value;
    });

    tampilkanForm();
    document.getElementById("keterangan").focus();
}

async function hapusPemasukan(id) {
    if (!confirm("Yakin ingin menghapus transaksi pemasukan ini?")) {
        return;
    }

    try {
        await deleteTransaction(id);
        showMessage("Pemasukan berhasil dihapus", "sukses");
        await muatDataPemasukan();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// ========================================
// TABEL & RINGKASAN
// ========================================

function tampilkanPemasukan() {
    let tabel = document.getElementById("tabelPemasukan");
    tabel.innerHTML = "";

    let cari = document.getElementById("cariPemasukan").value.trim().toLowerCase();
    let bulan = document.getElementById("filterBulanPemasukan").value;

    let data = dataTransaksi.filter(function (transaksi) {
        let cocokCari = cari === "" || String(transaksi.deskripsi).toLowerCase().includes(cari);
        let bulanTransaksi = String(transaksi.created_at || "").slice(5, 7);
        let cocokBulan = bulan === "" || bulanTransaksi === bulan;
        return cocokCari && cocokBulan;
    });

    if (data.length === 0) {
        let baris = tabel.insertRow();
        let cell = baris.insertCell(0);
        cell.colSpan = 6;
        cell.textContent = "Belum ada transaksi pemasukan.";
        cell.style.textAlign = "center";
        return;
    }

    data.forEach(function (transaksi) {
        let info = parseDeskripsi(transaksi.deskripsi);
        let baris = tabel.insertRow();

        baris.insertCell(0).textContent = formatTanggal(transaksi.created_at);
        baris.insertCell(1).textContent = info.siswa;
        baris.insertCell(2).textContent = info.keterangan;
        baris.insertCell(3).textContent = info.sumber;
        baris.insertCell(4).textContent = formatRupiah(transaksi.nominal);

        let cellAksi = baris.insertCell(5);

        let tombolEdit = document.createElement("button");
        tombolEdit.textContent = "Edit";
        tombolEdit.classList.add("edit-btn");
        tombolEdit.onclick = function () { editPemasukan(transaksi.id); };

        let tombolHapus = document.createElement("button");
        tombolHapus.textContent = "Hapus";
        tombolHapus.classList.add("hapus-btn");
        tombolHapus.onclick = function () { hapusPemasukan(transaksi.id); };

        cellAksi.appendChild(tombolEdit);
        cellAksi.appendChild(tombolHapus);
    });
}

function updateDashboardPemasukan() {
    let total = 0;
    let bulanIni = 0;

    let sekarang = new Date();
    let bulanSekarang = sekarang.getMonth() + 1;
    let tahunSekarang = sekarang.getFullYear();

    dataTransaksi.forEach(function (transaksi) {
        total += Number(transaksi.nominal);

        let created = String(transaksi.created_at || "");
        let bulan = Number(created.slice(5, 7));
        let tahun = Number(created.slice(0, 4));

        if (bulan === bulanSekarang && tahun === tahunSekarang) {
            bulanIni += Number(transaksi.nominal);
        }
    });

    document.getElementById("totalPemasukan").textContent = formatRupiah(total);
    document.getElementById("pemasukanBulanini").textContent = formatRupiah(bulanIni);
    document.getElementById("jumlahTransaksiPemasukan").textContent =
        dataTransaksi.length + " Transaksi";
}

async function muatDataPemasukan() {
    try {
        let hasil = await getTransactions();
        dataTransaksi = hasil.data.filter(function (item) {
            return item.jenis === "masuk";
        });
        tampilkanPemasukan();
        updateDashboardPemasukan();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// ========================================
// EVENT & LOAD
// ========================================

document.getElementById("formPemasukan").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        simpanPemasukan();
    }
});

document.getElementById("cariPemasukan").addEventListener("input", tampilkanPemasukan);
document.getElementById("filterBulanPemasukan").addEventListener("change", tampilkanPemasukan);

document.addEventListener("DOMContentLoaded", function () {
    tampilkanDaftarSiswa();
    muatDataPemasukan();
});
