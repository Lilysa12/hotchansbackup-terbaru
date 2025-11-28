document.addEventListener("DOMContentLoaded", async () => {
    // ==========================
    // KONFIGURASI SUPABASE
    // ==========================
    const SUPABASE_URL = "https://cwvcprzdovbpteiuuvgj.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmNwcnpkb3ZicHRlaXV1dmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzEwODYsImV4cCI6MjA3ODM0NzA4Nn0.Poi74Rm2rWUWGeoUTmP2CR5zlT_YqnY9j_OdjVz3tFw";
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ==========================
    // DEKLARASI VARIABEL UNTUK PAGINATION & SEARCH
    // (Asumsi ID HTML sama dengan Barang Keluar)
    // ==========================
    const tableBody = document.getElementById("table-body");
    const rowsPerPageSelect = document.getElementById("rows-per-page"); 
    const searchInput = document.getElementById("searchInput"); 
    const paginationControls = document.getElementById("pagination-controls"); 
    const totalBarangElement = document.getElementById("total-barang"); // Total stok barang (atau total barang masuk? Asumsi Total Barang Masuk)

    if (!tableBody || !rowsPerPageSelect || !searchInput || !paginationControls || !totalBarangElement) {
        console.error("Error: Salah satu elemen kontrol tabel (tbody, select, input search, atau pagination) tidak ditemukan. Pastikan ID HTML sudah benar!");
        return; 
    }

    let currentPage = 1;
    let currentLimit = parseInt(rowsPerPageSelect.value || '10'); 

    // --- Helper Function untuk Pindah Halaman ---
    async function goToPage(page) {
        // Ambil totalRows global untuk menghitung totalPages
        const { count: totalRows } = await supabase.from("barang_masuk").select(`id_barangmasuk`, { count: 'exact' });

        const totalPages = Math.ceil(totalRows / currentLimit);

        if (page < 1 || page > totalPages) return;

        currentPage = page;
        await loadBarangMasuk(currentPage, currentLimit, searchInput.value.trim()); 
    }

    // --- Fungsi Pembantu Pagination: Membuat Tombol Angka ---
    function createPageButton(pageNumber, container) {
        const pageBtn = document.createElement('span');
        pageBtn.textContent = String(pageNumber).padStart(2, '0');
        
        if (pageNumber === currentPage) {
            pageBtn.classList.add('active'); 
        } else {
            pageBtn.addEventListener('click', () => goToPage(pageNumber));
        }
        container.appendChild(pageBtn);
    }

    // --- Fungsi Pembantu Pagination: Menambahkan Elipsis (...) ---
    function appendEllipsis(container) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.padding = '0 5px';
        ellipsis.style.pointerEvents = 'none'; 
        ellipsis.style.opacity = '0.7'; 
        container.appendChild(ellipsis);
    }

    // --- Helper Function untuk Membuat Kontrol Pagination (Batasan 5 Tombol) ---
    function updatePaginationControls(totalRows) {
        const totalPages = Math.ceil(totalRows / currentLimit);
        paginationControls.innerHTML = ''; 

        if (totalRows === 0 || totalPages <= 1) {
            paginationControls.innerHTML = '';
            return; 
        }

        const maxPageButtons = 5; 
        let startPage, endPage;

        if (totalPages <= maxPageButtons) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const halfLimit = Math.floor(maxPageButtons / 2);
            startPage = currentPage - halfLimit;
            endPage = currentPage + halfLimit;

            if (startPage < 1) {
                startPage = 1;
                endPage = maxPageButtons;
            }

            if (endPage > totalPages) {
                endPage = totalPages;
                startPage = totalPages - maxPageButtons + 1;
            }
        }
        
        // Tombol SEBELUMNYA
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Sebelumnya';
        prevBtn.classList.add('page-nav', 'prev');
        prevBtn.disabled = currentPage === 1;
        if (currentPage > 1) {
            prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
        }
        paginationControls.appendChild(prevBtn);

        // Wadah Angka Halaman
        const pageNumbersDiv = document.createElement('div');
        pageNumbersDiv.classList.add('page-numbers');

        // Tombol '1' dan Elipsis Awal
        if (startPage > 1) {
            createPageButton(1, pageNumbersDiv);
            if (startPage > 2) {
                appendEllipsis(pageNumbersDiv); 
            }
        }

        // Tombol Halaman dalam Range
        for (let i = startPage; i <= endPage; i++) {
            createPageButton(i, pageNumbersDiv);
        }

        // Elipsis dan Tombol 'totalPages' Akhir
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                appendEllipsis(pageNumbersDiv); 
            }
            createPageButton(totalPages, pageNumbersDiv);
        }
        
        paginationControls.appendChild(pageNumbersDiv);

        // Tombol SELANJUTNYA
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Selanjutnya';
        nextBtn.classList.add('page-nav', 'next');
        nextBtn.disabled = currentPage === totalPages;
        if (currentPage < totalPages) {
            nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
        }
        paginationControls.appendChild(nextBtn);
    }
    
    // Helper untuk format rupiah
    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID').format(number);
    }

    // ==========================
    // FUNGSI LOAD DATA (READ) DENGAN PAGINATION & SEARCH
    // ==========================
    async function loadBarangMasuk(page = 1, limit = currentLimit, searchTerm = '') {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit - 1;

        // Query utama: Mengambil data barang_masuk dan menggabungkan dengan data_barang (untuk nama barang)
        let query = supabase
            .from("barang_masuk")
            .select(`
                *, 
                data_barang!inner(nama_barang, kode_barang)
            `, { count: 'exact' });

        if (searchTerm) {
            const searchPattern = `%${searchTerm}%`;
            // Search berdasarkan kode barang atau nama barang
            query = query.or(
                `data_barang.nama_barang.ilike.${searchPattern}, data_barang.kode_barang.ilike.${searchPattern}`
            );
        }

        const { data, error, count: totalRowsFiltered } = await query
            .order("tanggal", { ascending: false }) // Urutkan berdasarkan tanggal terbaru
            .range(startIndex, endIndex);

        if (error) {
            console.error("❌ Gagal memuat data barang masuk:", error);
            tableBody.innerHTML = `<tr><td colspan="8">Gagal memuat data 😢</td></tr>`;
            return;
        }

        tableBody.innerHTML = "";
        
        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8">Belum ada data barang masuk.</td></tr>`;
            totalBarangElement.textContent = "0";
            updatePaginationControls(0);
            return;
        }

        // Dapatkan Total Barang Masuk Global (untuk kartu summary)
        let totalMasuk = 0;
        const { data: allData, error: totalError } = await supabase.from("barang_masuk").select(`stok_barang`);
         if (allData && !totalError) {
            totalMasuk = allData.reduce((sum, item) => sum + (item.stok_barang || 0), 0);
         }
        

        data.forEach((item) => {
            const tanggal = item.tanggal ? new Date(item.tanggal) : null;
            const tanggalFormat = tanggal ? tanggal.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "N/A";
            const waktuFormat = tanggal ? tanggal.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(/\./g, ':') : "00:00";
            
            const kodeBarang = item.data_barang?.kode_barang || "-";
            const namaBarang = item.data_barang?.nama_barang || "-";
            const merek = item.merek || "-";
            const hargaBeli = item.harga_beli || 0;
            const hargaJual = item.harga_jual || 0;
            const jumlah = item.stok_barang || 0;
            
            const row = `
            <tr>
                <td>${kodeBarang}</td>
                <td>${namaBarang}</td>
                <td><span class="date-highlight">${tanggalFormat}</span></td>
                <td>${waktuFormat}</td>
                <td>${merek}</td>
                <td>${formatRupiah(hargaBeli)}</td>
                <td>${formatRupiah(hargaJual)}</td>
                <td>${jumlah}</td>
                <td class="action-col">
                    <img src="../assets/gambar/icons/edit.png" alt="Edit" class="action-icon open-edit-modal" data-id="${item.id_barangmasuk}">
                    <img src="../assets/gambar/icons/delete.png" alt="Delete" class="action-icon open-delete-modal" data-id="${item.id_barangmasuk}">
                </td>
            </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

        // Tampilkan total barang masuk global
        totalBarangElement.textContent = totalMasuk.toLocaleString("id-ID");
        
        // Update kontrol pagination berdasarkan jumlah baris yang difilter/dicari
        updatePaginationControls(totalRowsFiltered || 0); 
    }

    // ==========================
    // FUNGSI TAMBAH BARANG (CREATE)
    // ==========================
    // Catatan: Asumsi form memiliki ID yang sesuai (add-form, add-kode, add-nama, dsb.)
    async function handleAddSubmit(event) {
        event.preventDefault();
        
        // Asumsi form input memiliki ID:
        const kode = document.getElementById('add-kode').value; // Ambil kode barang
        const nama = document.getElementById('add-nama').value; // Ambil nama barang
        const tanggal = document.getElementById('add-tanggal').value;
        const waktu = document.getElementById('add-waktu').value;
        const merek = document.getElementById('add-merek').value;
        const hargaBeli = parseInt(document.getElementById('add-harga-beli').value) || 0;
        const hargaJual = parseInt(document.getElementById('add-harga-jual').value) || 0;
        const jumlah = parseInt(document.getElementById('add-jumlah').value) || 0;
        
        // Anda perlu mendapatkan id_barang dari Supabase berdasarkan kode atau nama barang
        // Ini membutuhkan fungsi helper terpisah untuk mencari id_barang
        // Untuk contoh ini, kita asumsikan id_barang adalah string yang perlu diisi (atau bisa dikesampingkan jika kode_barang/nama_barang cukup)
        
        // Untuk saat ini, kita akan menggunakan kode/nama barang yang di-input, namun ini berisiko jika tidak ada relasi data_barang
        // PENTING: Dalam aplikasi nyata, Anda harus melakukan pencarian ID_BARANG sebelum INSERT ke barang_masuk!
        const idBarang = 1; // Placeholder, GANTI DENGAN LOGIKA PENCARIAN ID_BARANG NYATA

        const timestamp = combineDateTime(tanggal, waktu); 

        const { error } = await supabase
            .from('barang_masuk')
            .insert([{
                id_barang: idBarang, 
                kode_barang: kode, // Disarankan menggunakan relasi id_barang saja, tapi mengikuti skema Anda
                merek: merek,
                harga_beli: hargaBeli,
                harga_jual: hargaJual,
                tanggal: timestamp,
                stok_barang: jumlah // Stok di sini berarti jumlah barang masuk
            }]);

        if (error) {
            console.error("Gagal menambah data barang masuk:", error);
            alert(`GAGAL MENAMBAH DATA BARANG MASUK:\n${error.message}`);
        } else {
            document.getElementById('add-form').reset();
            closeModal(); // Panggil fungsi frontend
            // Refresh ke halaman 1 setelah tambah data
            currentPage = 1;
            loadBarangMasuk(currentPage, currentLimit, searchInput.value.trim()); 
        }
    }

    // ==========================
    // FUNGSI EDIT BARANG (UPDATE)
    // ==========================
    async function handleEditSubmit(event) {
        event.preventDefault();

        const id = document.getElementById('edit-id').value; 
        if (!id) {
            alert("ID barang masuk tidak ditemukan, tidak bisa mengedit.");
            return;
        }
        
        // Asumsi form input memiliki ID:
        const merek = document.getElementById('edit-merek').value;
        const hargaBeli = parseInt(document.getElementById('edit-harga-beli').value) || 0;
        const hargaJual = parseInt(document.getElementById('edit-harga-jual').value) || 0;
        const tanggal = document.getElementById('edit-tanggal').value;
        const waktu = document.getElementById('edit-waktu').value;
        const jumlah = parseInt(document.getElementById('edit-jumlah').value) || 0;

        const timestamp = combineDateTime(tanggal, waktu); 

        const { error } = await supabase
            .from('barang_masuk')
            .update({
                merek: merek,
                harga_beli: hargaBeli,
                harga_jual: hargaJual,
                tanggal: timestamp,
                stok_barang: jumlah
            })
            .eq('id_barangmasuk', id); 

        if (error) {
            console.error("Gagal mengedit data barang masuk:", error);
            alert(`GAGAL MENGEDIT DATA BARANG MASUK:\n${error.message}`);
        } else {
            closeModal(); // Panggil fungsi frontend
            // Refresh tabel
            loadBarangMasuk(currentPage, currentLimit, searchInput.value.trim()); 
        }
    }

    // ==========================
    // FUNGSI HAPUS BARANG (DELETE)
    // ==========================
    async function handleDelete(id) {
        if (!id) {
            console.error("ID barang masuk tidak ditemukan.");
            return;
        }

        const { error } = await supabase
            .from('barang_masuk')
            .delete()
            .eq('id_barangmasuk', id); 

        if (error) {
            console.error("Gagal menghapus data barang masuk:", error);
            alert(`GAGAL MENGHAPUS DATA BARANG MASUK:\n${error.message}`);
        } else {
            closeModal(); // Panggil fungsi frontend
            // Refresh tabel
            loadBarangMasuk(currentPage, currentLimit, searchInput.value.trim()); 
        }
    }

    // ==========================
    // EVENT LISTENER UNTUK PAGINATION (LIHAT N)
    // ==========================
    rowsPerPageSelect.addEventListener('change', async () => {
        currentLimit = parseInt(rowsPerPageSelect.value);
        currentPage = 1; 
        await loadBarangMasuk(currentPage, currentLimit, searchInput.value.trim());
    });

    // ==========================
    // EVENT LISTENER UNTUK PENCARIAN (CARI)
    // ==========================
    searchInput.addEventListener('input', async () => {
        const searchTerm = searchInput.value.trim();
        currentPage = 1; 
        await loadBarangMasuk(currentPage, currentLimit, searchTerm);
    });

    // ==========================
    // INISIALISASI
    // ==========================
    // Panggil fungsi add submit (Asumsi ID form adalah 'add-form')
    const addForm = document.getElementById("add-form");
    if (addForm) addForm.addEventListener("submit", handleAddSubmit);

    // Panggil fungsi edit submit (Asumsi ID form adalah 'edit-form')
    const editForm = document.getElementById("edit-form");
    if (editForm) editForm.addEventListener("submit", handleEditSubmit);
    
    // Panggil fungsi load awal
    await loadBarangMasuk(currentPage, currentLimit, searchInput.value.trim()); 
});