// ========================================
// API CLIENT — dipakai semua halaman
// ========================================

// Bisa dioverride sebelum script ini dimuat, mis. window.DOFTECH_API_BASE = "http://localhost:3000"
var API_BASE = window.DOFTECH_API_BASE || "http://localhost:3000";

async function apiRequest(path, options) {
    let response;

    try {
        response = await fetch(API_BASE + path, Object.assign({
            headers: { "Content-Type": "application/json" }
        }, options || {}));
    } catch (error) {
        throw new Error("Tidak dapat terhubung ke backend. Pastikan server berjalan di " + API_BASE);
    }

    let data;
    try {
        data = await response.json();
    } catch (error) {
        throw new Error("Respons backend bukan JSON (status " + response.status + ")");
    }

    if (!response.ok) {
        throw new Error(data.error || "Permintaan gagal (" + response.status + ")");
    }

    return data;
}

function getTransactions() {
    return apiRequest("/api/transactions");
}

function createTransaction(payload) {
    return apiRequest("/api/transactions", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

function updateTransaction(id, payload) {
    return apiRequest("/api/transactions/" + id, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}

function deleteTransaction(id) {
    return apiRequest("/api/transactions/" + id, { method: "DELETE" });
}

function getSiswa() {
    return apiRequest("/api/siswa");
}

function createSiswa(payload) {
    return apiRequest("/api/siswa", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

function updateSiswa(id, payload) {
    return apiRequest("/api/siswa/" + id, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}

function deleteSiswa(id) {
    return apiRequest("/api/siswa/" + id, { method: "DELETE" });
}

// ========================================
// FORMAT
// ========================================

function formatRupiah(nominal) {
    return "Rp" + Number(nominal).toLocaleString("id-ID");
}

function formatTanggal(nilai) {
    if (!nilai) return "-";

    // SQLite mengembalikan "YYYY-MM-DD HH:MM:SS"; "T" membuatnya ISO-valid.
    let tanggal = new Date(String(nilai).replace(" ", "T"));

    if (isNaN(tanggal.getTime())) return nilai;

    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(tanggal);
}

function buildDeskripsi() {
    return Array.prototype.slice.call(arguments)
        .map(function (bagian) {
            return typeof bagian === "string" ? bagian.trim() : "";
        })
        .filter(function (bagian) {
            return bagian !== "";
        })
        .join(" • ");
}

// ========================================
// NOTIFIKASI (sukses / error)
// ========================================

function showMessage(text, type) {
    let toast = document.getElementById("toastPesan");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toastPesan";
        document.body.appendChild(toast);
    }

    toast.className = "toast " + (type === "error" ? "toast-error" : "toast-sukses");
    toast.textContent = text;
    toast.style.display = "block";

    clearTimeout(showMessage._timer);
    showMessage._timer = setTimeout(function () {
        toast.style.display = "none";
    }, 3500);
}
