// ========================================
// DASHBOARD — data dari GET /api/transactions
// ========================================

function renderTransaksi(data) {
    let tabel = document.getElementById("tabelTransaksi");
    tabel.innerHTML = "";

    if (data.length === 0) {
        let baris = tabel.insertRow();
        let cell = baris.insertCell(0);
        cell.colSpan = 4;
        cell.textContent = "Belum ada transaksi.";
        cell.style.textAlign = "center";
        return;
    }

    data.forEach(function (transaksi) {
        let baris = tabel.insertRow();

        // Kolom "Nama" menampilkan deskripsi dari API
        baris.insertCell(0).textContent = transaksi.deskripsi;
        baris.insertCell(1).textContent = formatTanggal(transaksi.created_at);

        let cellJenis = baris.insertCell(2);
        let badge = document.createElement("span");
        let masuk = transaksi.jenis === "masuk";
        badge.className = masuk ? "income" : "expense";
        badge.textContent = masuk ? "Masuk" : "Keluar";
        cellJenis.appendChild(badge);

        baris.insertCell(3).textContent = formatRupiah(transaksi.nominal);
    });
}

function renderRingkasan(data) {
    let totalMasuk = 0;
    let totalKeluar = 0;

    data.forEach(function (transaksi) {
        if (transaksi.jenis === "masuk") {
            totalMasuk += Number(transaksi.nominal);
        } else {
            totalKeluar += Number(transaksi.nominal);
        }
    });

    document.getElementById("totalPemasukan").textContent = formatRupiah(totalMasuk);
    document.getElementById("totalPengeluaran").textContent = formatRupiah(totalKeluar);
    document.getElementById("totalKas").textContent = formatRupiah(totalMasuk - totalKeluar);
}

async function muatDashboard() {
    try {
        let hasil = await getTransactions();
        renderTransaksi(hasil.data);
        renderRingkasan(hasil.data);
    } catch (error) {
        let tabel = document.getElementById("tabelTransaksi");
        tabel.innerHTML = "";
        let baris = tabel.insertRow();
        let cell = baris.insertCell(0);
        cell.colSpan = 4;
        cell.textContent = "Gagal memuat data transaksi.";
        cell.style.textAlign = "center";
        showMessage(error.message, "error");
    }
}

document.addEventListener("DOMContentLoaded", muatDashboard);
