// Mendeklarasikan variabel global untuk overlay, semua modal, dan tombol konfirmasi hapus
let overlay;
let allModalContents;
let confirmDeleteBtn;

/**
 * Menutup semua konten modal (.modal-content)
 * Fungsi ini menghapus class "show" dari semua modal agar tidak terlihat
 */
function closeAllContents() {
    if (!allModalContents) {
        allModalContents = document.querySelectorAll(".modal-content");
    }
    allModalContents.forEach((modal) => modal.classList.remove("show"));
}

/**
 * Menutup overlay dan modal (default: keduanya)
 */
function closeModal(shouldCloseOverlay = true) {
    if (!overlay) overlay = document.getElementById("modal-overlay");
    // Tutup semua modal
    closeAllContents();

    // Jika overlay ingin ditutup, hapus class "show"
    if (shouldCloseOverlay && overlay) {
        overlay.classList.remove("show");
    }
}

// Menampilkan modal spesifik berdasarkan ID
function openModal(modalId) {
    const modalContent = document.getElementById(modalId);
    if (!overlay) overlay = document.getElementById("modal-overlay");

    if (modalContent && overlay) {
        // Tutup semua modal
        closeAllContents();
        // Jika overlay ingin ditutup, hapus class "show"
        overlay.classList.add("show");
        modalContent.classList.add("show");
    }
}

// Parsing tanggal format "12 November 2025" ke "2025-11-12"
 
function parseDate(dateStr) {
    if (!dateStr) return null;

    // Mapping nama bulan ke nomor bulan
    const months = {
        Januari: "01",
        Februari: "02",
        Maret: "03",
        April: "04",
        Mei: "05",
        Juni: "06",
        Juli: "07",
        Agustus: "08",
        September: "09",
        Oktober: "10",
        November: "11",
        Desember: "12",
    };

    // Hapus tag HTML jika ada
    const cleanDateStr = dateStr.replace(/<[^>]+>/g, "").trim();
    const parts = cleanDateStr.split(" ");

    if (parts.length === 3 && months[parts[1]]) {
        const day = parts[0].padStart(2, "0");
        const month = months[parts[1]];
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }
    return null;
}

// === EVENT UTAMA ===
document.addEventListener("DOMContentLoaded", () => {
    // Mengambil elemen tbody tabel
    const tableBody = document.getElementById("table-body");
    // Mengambil overlay modal
    overlay = document.getElementById("modal-overlay");
    // Mengambil semua modal-content
    allModalContents = document.querySelectorAll(".modal-content");
    // Tombol konfirmasi hapus
    confirmDeleteBtn = document.getElementById("confirm-delete");

    // 1. Load data
    if (typeof loadBarangKeluar === "function") {
        loadBarangKeluar();
    } else {
        console.warn(
            "⚠️ Fungsi loadBarangKeluar() tidak ditemukan. Pastikan backend sudah terhubung."
        );
    }

    // 2. Tambah data
    const addForm = document.getElementById("add-form");
    if (addForm && typeof handleAddSubmit === "function") {
        addForm.addEventListener("submit", handleAddSubmit);
    }

    // 3. Edit data
    const editForm = document.getElementById("edit-form");
    if (editForm && typeof handleEditSubmit === "function") {
        editForm.addEventListener("submit", handleEditSubmit);
    }

    // 4. Konfirmasi hapus
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            const id = confirmDeleteBtn.dataset.id;
            if (typeof handleDelete === "function" && id) {
                handleDelete(id);
                closeModal();
            }
        });
    }

    // 5. Batal hapus
    document.getElementById("cancel-delete")?.addEventListener("click", closeModal);

    // 6. Cetak data
    const submitPrintBtn = document.getElementById("submit-print");
    if (submitPrintBtn) {
        submitPrintBtn.addEventListener("click", (e) => {
            e.preventDefault();
            closeModal();
            setTimeout(() => window.print(), 300);
        });
    }

    // 7. Buka modal Tambah & Cetak
    document.getElementById("open-add-modal")?.addEventListener("click", () =>
        openModal("add-modal")
    );
    document.getElementById("open-print-modal")?.addEventListener("click", () =>
        openModal("print-modal")
    );

    // 8. Tutup semua modal (tombol X)
    document.querySelectorAll(".close-modal").forEach((btn) =>
        btn.addEventListener("click", closeModal)
    );

    // 9. Klik di luar modal
    if (overlay) {
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) closeModal();
        });
    }

    // 10. Klik tombol Edit / Delete di tabel
    if (tableBody) {
        tableBody.addEventListener("click", (e) => {
            const editButton = e.target.closest(".open-edit-modal");
            const deleteButton = e.target.closest(".open-delete-modal");

            // Edit data
            if (editButton) {
                const id = editButton.dataset.id;
                const tr = editButton.closest("tr");
                if (!tr || !id) return;

                const cells = tr.cells;
                const kode = cells[0].textContent.trim();
                const nama = cells[1].textContent.trim();
                const tanggalStr = cells[2].innerHTML;
                const waktuStr = cells[3].textContent.trim();
                const jumlah = cells[4].textContent.trim();

                const tanggalISO = parseDate(tanggalStr);
                const waktuISO = waktuStr.includes(".")
                    ? waktuStr.replace(".", ":")
                    : waktuStr;

                try {
                    // Mengisi form edit dengan data dari tabel
                    document.getElementById("edit-id").value = id;
                    document.getElementById("edit-kode").value = kode;
                    document.getElementById("edit-nama").value = nama;
                    document.getElementById("edit-tanggal").value = tanggalISO || "";
                    document.getElementById("edit-waktu").value = waktuISO || "";
                    document.getElementById("edit-jumlah").value = jumlah;
                    openModal("edit-modal");
                } catch (err) {
                    console.error("Error mengisi form edit:", err);
                }
            } else if (deleteButton) {
                const id = deleteButton.dataset.id;
                if (confirmDeleteBtn && id) {
                    confirmDeleteBtn.dataset.id = id;
                    openModal("delete-modal");
                }
            }
        });
    }
});
