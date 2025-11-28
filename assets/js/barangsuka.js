// Menunggu seluruh konten DOM dimuat sebelum menjalankan script
document.addEventListener('DOMContentLoaded', () => {
    // Mengambil elemen overlay modal
    const overlay = document.getElementById('modal-overlay');
    // Mengambil elemen tbody tabel sekali untuk efisiensi
    const tableBody = document.getElementById('table-body'); // Ambil table-body sekali

    // --- Fungsi Global untuk membuka modal ---
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal && overlay) {
            overlay.classList.add('show');
            modal.classList.add('show');
        }
    }

    // --- Fungsi Global untuk menutup semua modal ---
    function closeModal() {
        if (overlay) {
            overlay.classList.remove('show');
        }
        document.querySelectorAll('.modal-content.show').forEach((modal) => {
            modal.classList.remove('show');
        });
    }

    // --- Helper Function untuk Ubah Tanggal ---
    function parseDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return null;

        const months = {
            'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
            'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
            'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
        };
        // Hapus tag HTML dan trim spasi
        const cleanDateStr = dateStr.replace(/<[^>]+>/g, '').trim();
        const parts = cleanDateStr.split(' ');

        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = months[parts[1]] || '01';
            const year = parts[2];
            return `${year}-${month}-${day}`;
        }

        // fallback: coba parse ISO / tanggal biasa
        try {
            const d = new Date(cleanDateStr);
            if (!isNaN(d)) {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            }
        } catch (e) { /* ignore */ }

        return null;
    }

    // --- Menangani Tombol BUKA Modal ---
    // Semua tombol tambah barang (boleh ada lebih dari satu)
    const openAddBtns = document.querySelectorAll('#open-add-modal-baru');
    if (openAddBtns && openAddBtns.length) {
        openAddBtns.forEach(btn => {
            btn.addEventListener('click', () => openModal('add-modal-baru'));
        });
    }

    // Tombol tambah barang lama
        const openAddBtnLama = document.querySelectorAll('#open-add-modal-lama');
    if (openAddBtnLama && openAddBtns.length) {
        openAddBtnLama.forEach(btn => {
            btn.addEventListener('click', () => openModal('add-modal-lama'));
        });
    }

    // Tombol cetak modal
    const openPrintBtn = document.getElementById('open-print-modal');
    if (openPrintBtn) {
        openPrintBtn.addEventListener('click', () => openModal('print-modal'));
    }

    // --- Event Delegation untuk Tombol Edit & Hapus ---
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            // Cek tombol Edit
            const editButton = e.target.closest('.open-edit-modal');
            if (editButton) {
                const tr = editButton.closest('tr');
                if (!tr) return;
                const cells = tr.cells;
                
                // Ambil semua data dari sel
                const kode = (cells[0]?.textContent || '').trim();
                const nama = (cells[1]?.textContent || '').trim();
                const tanggalStr = cells[2]?.innerHTML || '';
                const waktuStr = (cells[3]?.textContent || '').trim();
                const merek = (cells[4]?.textContent || '').trim();
                const hargaBeli = (cells[5]?.textContent || '').trim();
                const hargaJual = (cells[6]?.textContent || '').trim();
                const jumlah = (cells[7]?.textContent || '').trim();

                const tanggalISO = parseDate(tanggalStr);
                const waktuISO = waktuStr.replace('.', ':');
                
                // Ambil elemen input form edit
                const editKodeEl = document.getElementById('edit-kode');
                const editNamaEl = document.getElementById('edit-nama');
                const editTanggalEl = document.getElementById('edit-tanggal');
                const editWaktuEl = document.getElementById('edit-waktu');
                const editMerekEl = document.getElementById('edit-merek');
                const editHargaBeliEl = document.getElementById('edit-harga-beli');
                const editHargaJualEl = document.getElementById('edit-harga-jual');
                const editJumlahEl = document.getElementById('edit-jumlah');

                // Isi form edit dengan data dari tabel
                if (editKodeEl) editKodeEl.value = kode;
                if (editNamaEl) editNamaEl.value = nama;
                if (editTanggalEl) editTanggalEl.value = tanggalISO || '';
                if (editWaktuEl) editWaktuEl.value = waktuISO || '';
                if (editMerekEl) editMerekEl.value = merek;
                if (editHargaBeliEl) editHargaBeliEl.value = hargaBeli.replace(/\./g, '');
                if (editHargaJualEl) editHargaJualEl.value = hargaJual.replace(/\./g, '');
                if (editJumlahEl) editJumlahEl.value = jumlah;

                openModal('edit-modal');
            }

            // Cek tombol Hapus
            const deleteButton = e.target.closest('.open-delete-modal');

            if (deleteButton) {
                const tr = deleteButton.closest('tr');
                if (!tr) return;
                const id = (tr.cells[0]?.textContent || '').trim();
                const confirmDelete = document.getElementById('confirm-delete');
                if (confirmDelete) {
                    confirmDelete.dataset.id = id;
                }
                openModal('delete-modal');
            }
        });
    }

    // --- Menangani Tombol TUTUP Modal ---
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Klik di overlay menutup modal
    if (overlay) {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeModal();
            }
        });
    }

    // --- Tombol Konfirmasi Hapus ---
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            const id = confirmDeleteBtn.dataset.id;
            // contoh aksi hapus: panggil API / Supabase di sini
            alert(`Data untuk ID ${id} (pura-pura) telah dihapus!`);
            closeModal();
        });
    }

    // Tombol batal hapus menutup modal
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeModal);
    }

    // --- Tombol Cetak ---
    const submitPrintBtn = document.getElementById('submit-print');
    if (submitPrintBtn) {
        submitPrintBtn.addEventListener('click', () => {
            closeModal();
            setTimeout(() => {
                window.print();
            }, 300);
        });
    }

    // --- Fungsionalitas Pencarian Tabel ---
    const searchInput = document.getElementById('searchInput');
    if (searchInput && tableBody) {
        searchInput.addEventListener('keyup', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const rows = tableBody.getElementsByTagName('tr');
            for (let i = 0; i < rows.length; i++) {
                const rowText = rows[i].textContent.toLowerCase();
                rows[i].style.display = rowText.includes(searchTerm) ? "" : "none";
            }
        });
    }

    // --- Highlight menu aktif berdasarkan URL saat ini ---
    const currentLocation = window.location.href;
    const menuItems = document.querySelectorAll(".nav-menu .nav-item");
    menuItems.forEach((item) => {
        if (item.href === currentLocation) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // --- Fungsionalitas Ikon Kalender ---
    const inputBulan = document.getElementById('print-bulan');
    const ikonKalender = document.getElementById('print-bulan-icon');
    if (inputBulan && ikonKalender) {
        ikonKalender.addEventListener('click', () => {
            try {
                inputBulan.showPicker();
            } catch (error) {
                console.error("Browser tidak mendukung .showPicker():", error);
                inputBulan.focus();
            }
        });
    }

    // --- Validasi Tahun Maksimal 4 Digit ---
    const tanggalInputs = [document.getElementById('add-tanggal'), document.getElementById('edit-tanggal')];
    tanggalInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                const val = input.value;
                const dateParts = val.split('-');
                const year = dateParts[0];
                if (year && year.length > 4) {
                    dateParts[0] = year.slice(0, 4);
                    input.value = dateParts.join('-');
                }
            });
        }
    });
});
