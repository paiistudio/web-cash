console.log("FILE JS SISWA TERBACA");

// ========================================
// STATE (sumber data: API /api/siswa)
// ========================================

let dataSiswa = [];
let idSiswaEdit = null;

// ========================================
// FORM
// ========================================

function tampilkanForm() {
    document.getElementById("formSiswa").style.display = "block";

    if (idSiswaEdit === null) {
        document.querySelector("#formSiswa h3").textContent = "Tambah Siswa";
    }
}

function sembunyikanForm() {
    document.getElementById("formSiswa").style.display = "none";
}

function resetForm() {
    document.getElementById("nama").value = "";
    document.getElementById("kelas").value = "";
    idSiswaEdit = null;
    document.querySelector("#formSiswa h3").textContent = "Tambah Siswa";
}

// ========================================
// TAMBAH / EDIT SISWA
// ========================================

async function tambahsiswa() {
    let nama = document.getElementById("nama").value.trim();
    let kelas = document.getElementById("kelas").value.trim();

    if (nama === "") {
        showMessage("Nama siswa belum diisi!", "error");
        document.getElementById("nama").focus();
        return;
    }

    if (kelas === "") {
        showMessage("Kelas belum diisi!", "error");
        document.getElementById("kelas").focus();
        return;
    }

    let payload = { nama: nama, kelas: kelas };

    try {
        if (idSiswaEdit !== null) {
            await updateSiswa(idSiswaEdit, payload);
            showMessage("Data siswa berhasil diperbarui", "sukses");
        } else {
            await createSiswa(payload);
            showMessage("Data siswa berhasil ditambahkan", "sukses");
        }

        resetForm();
        sembunyikanForm();
        await muatDataSiswa();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// ========================================
// EDIT SISWA
// ========================================

function editSiswa(id) {
    let siswa = dataSiswa.find(function (item) {
        return item.id === id;
    });

    if (!siswa) {
        showMessage("Data siswa tidak ditemukan", "error");
        return;
    }

    idSiswaEdit = id;
    document.getElementById("nama").value = siswa.nama;
    document.getElementById("kelas").value = siswa.kelas;
    document.querySelector("#formSiswa h3").textContent = "Edit Siswa";

    tampilkanForm();
    document.getElementById("nama").focus();
}

// ========================================
// HAPUS SISWA
// ========================================

async function hapusSiswa(id) {
    if (!confirm("Yakin ingin menghapus siswa ini?")) {
        return;
    }

    try {
        await deleteSiswa(id);
        showMessage("Data siswa berhasil dihapus", "sukses");
        await muatDataSiswa();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// ========================================
// TAMPILKAN KE TABEL
// ========================================

function tampilkanSiswa(pesanKosong) {
    let tabel = document.getElementById("tabelSiswa");
    tabel.innerHTML = "";

    if (dataSiswa.length === 0) {
        let baris = tabel.insertRow();
        let cell = baris.insertCell(0);
        cell.colSpan = 4;
        cell.textContent = pesanKosong || "Belum ada data siswa.";
        cell.style.textAlign = "center";
        return;
    }

    dataSiswa.forEach(function (siswa, index) {
        let baris = tabel.insertRow();

        baris.insertCell(0).textContent = index + 1;
        baris.insertCell(1).textContent = siswa.nama;
        baris.insertCell(2).textContent = siswa.kelas;

        let cellAksi = baris.insertCell(3);

        let tombolEdit = document.createElement("button");
        tombolEdit.textContent = "Edit";
        tombolEdit.classList.add("edit-btn");
        tombolEdit.onclick = function () {
            editSiswa(siswa.id);
        };

        let tombolHapus = document.createElement("button");
        tombolHapus.textContent = "Hapus";
        tombolHapus.classList.add("hapus-btn");
        tombolHapus.onclick = function () {
            hapusSiswa(siswa.id);
        };

        cellAksi.appendChild(tombolEdit);
        cellAksi.appendChild(tombolHapus);
    });
}

async function muatDataSiswa() {
    try {
        let hasil = await getSiswa();
        dataSiswa = hasil.data || [];
        tampilkanSiswa();
    } catch (error) {
        dataSiswa = [];
        tampilkanSiswa("Data siswa tidak dapat dimuat.");
        showMessage(error.message, "error");
    }
}

// ========================================
// ENTER = SIMPAN
// ========================================

document.getElementById("formSiswa").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        tambahsiswa();
    }
});

// ========================================
// SAAT HALAMAN DIBUKA
// ========================================

muatDataSiswa();
