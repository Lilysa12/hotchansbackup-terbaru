document.addEventListener("DOMContentLoaded", async () => {
// Menjalankan kode setelah halaman web selesai dimuat.

    // ==========================
    // KONFIGURASI SUPABASE
    // ==========================
    const SUPABASE_URL = "https://cwvcprzdovbpteiuuvgj.supabase.co";
    // Alamat project Supabase (Berisi database).
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmNwcnpkb3ZicHRlaXV1dmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzEwODYsImV4cCI6MjA3ODM0NzA4Nn0.Poi74Rm2rWUWGeoUTmP2CR5zlT_YqnY9j_OdjVz3tFw";
    // Kunci untuk mengakses Supabase dari website (khusus role anon).
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    // Membuat koneksi ke Supabase sehingga website bisa baca/tulis data.

    // ==========================
    // DEKLARASI VARIABEL UNTUK PAGINATION & SEARCH
    // ==========================
    const tableBody = document.getElementById("table-body");
    // Mengambil elemen <tbody> tempat data tabel akan ditampilkan.

    // ID disinkronkan: rows-per-page
    const rowsPerPageSelect = document.getElementById("rows-per-page"); 
    // Mengambil elemen dropdown yang menentukan jumlah baris per halaman.
    const searchInput = document.getElementById("searchInput"); 
    // Mengambil input pencarian untuk memfilter data.

    // ID disinkronkan: pagination-controls
    const paginationControls = document.getElementById("pagination-controls"); 
    // Mengambil elemen pembungkus tombol pagination (prev, next, nomor halaman).
    const totalBarangElement = document.getElementById("total-barang");
    // Mengambil elemen untuk menampilkan jumlah total barang.

    if (!tableBody || !rowsPerPageSelect || !searchInput || !paginationControls || !totalBarangElement) {
     // Mengecek apakah ada elemen HTML yang tidak ditemukan (null).
    // Jika salah satu elemen tidak ada, proses dihentikan untuk mencegah error.   
        console.error("Error: Salah satu elemen kontrol tabel (tbody, select, input search, atau pagination) tidak ditemukan. Pastikan ID HTML sudah benar!");
        // Menampilkan pesan error di console agar mudah mengetahui ID mana yang salah.
        return; 
        // Menghentikan fungsi agar script tidak lanjut dan menyebabkan error lainnya.
    }

    let currentPage = 1;
    // Menyimpan halaman yang sedang aktif (default dimulai dari halaman 1).
    let currentLimit = parseInt(rowsPerPageSelect.value || '10'); 
    // Menyimpan jumlah data per halaman.
   // Diambil dari dropdown 'rows-per-page'. Jika kosong, gunakan nilai default 10.

    // --- Helper Function untuk Pindah Halaman ---
    async function goToPage(page) {
    // Fungsi untuk pindah ke halaman tertentu.

        // Ambil totalRows global untuk menghitung totalPages
        const { count: totalRows } = await supabase.from("barang_keluar").select(`id_barangkeluar`, { count: 'exact' });
        // Mengambil jumlah seluruh data dari tabel "barang_keluar".

        const totalPages = Math.ceil(totalRows / currentLimit);
        // Menghitung total halaman berdasarkan total data dan batas data per halaman.

        if (page < 1 || page > totalPages) return;
        // Jika nomor halaman terlalu kecil atau terlalu besar, hentikan (tidak melakukan apa-apa).

        currentPage = page;
        // Mengubah halaman aktif ke halaman yang diminta.
        await loadBarangKeluar(currentPage, currentLimit, searchInput.value.trim()); 
        // Memuat data tabel sesuai dengan halaman yang baru dipilih.
    }

    // --- Fungsi Pembantu Pagination: Membuat Tombol Angka ---
    function createPageButton(pageNumber, container) {
        const pageBtn = document.createElement('span');
         // Membuat elemen <span> yang akan dipakai sebagai tombol halaman.
        pageBtn.textContent = String(pageNumber).padStart(2, '0');
        // Menampilkan nomor halaman, dan memastikan selalu 2 digit (contoh: 1 → "01").
        
        if (pageNumber === currentPage) {
            pageBtn.classList.add('active'); 
        // Jika nomor halaman ini sama dengan halaman yang sedang dibuka,
        // tambahkan kelas "active" supaya tombol terlihat sedang dipilih.
        } else {
            pageBtn.addEventListener('click', () => goToPage(pageNumber));
            // Jika bukan halaman aktif, tambahkan event klik untuk pindah halaman.
        }
        container.appendChild(pageBtn);
         // Memasukkan tombol halaman ke dalam container pagination di HTML.
    }

    // --- Fungsi Pembantu Pagination: Menambahkan Elipsis (...) ---
    function appendEllipsis(container) {
        const ellipsis = document.createElement('span');
         // Membuat elemen <span> untuk menampilkan tanda titik-titik (...).
        ellipsis.textContent = '...';
        // Mengatur isi teks menjadi tiga titik.
        ellipsis.style.padding = '0 5px';
        // Memberikan jarak kiri dan kanan agar tidak terlalu rapat.
        ellipsis.style.pointerEvents = 'none'; 
        // Membuat elipsis tidak bisa diklik (hanya tampilan saja).
        ellipsis.style.opacity = '0.7'; 
        // Membuat warna sedikit transparan supaya terlihat bukan tombol aktif.

        container.appendChild(ellipsis);
        // Menambahkan elipsis ke dalam elemen pagination.
    }

    // --- Helper Function untuk Membuat Kontrol Pagination (Batasan 5 Tombol) ---
    function updatePaginationControls(totalRows) {
        const totalPages = Math.ceil(totalRows / currentLimit);
        // Menghitung total halaman berdasarkan total data dan batas data per halaman.
        paginationControls.innerHTML = ''; 
        // Menghapus seluruh tombol pagination sebelumnya agar bisa dibuat ulang.

        if (totalRows === 0 || totalPages <= 1) {
        // Jika tidak ada data, atau hanya ada 1 halaman,
        // pagination tidak perlu ditampilkan.
            paginationControls.innerHTML = '';
            // Kosongkan pagination.
            return; 
        // Hentikan fungsi karena tidak perlu membuat tombol apapun.   
        }

        const maxPageButtons = 5; 
        // Jumlah maksimal tombol halaman yang ingin ditampilkan (misal hanya 5 tombol).
        let startPage, endPage;
        // Variabel untuk menentukan dari halaman berapa sampai halaman berapa tombol pagination dibuat.

        if (totalPages <= maxPageButtons) {
        // Jika total halaman lebih sedikit atau sama dengan 5,
       // maka tampilkan semua halaman tanpa perlu dipotong. 
            startPage = 1;
            // Mulai dari halaman pertama.
            endPage = totalPages;
            // Berakhir di halaman terakhir.
        } else {
            const halfLimit = Math.floor(maxPageButtons / 2);
            // Mengambil setengah jumlah tombol (contoh: 5 → 2) supaya halaman aktif bisa berada di tengah.
            startPage = currentPage - halfLimit;
            // Mengatur halaman awal supaya mulai beberapa nomor sebelum halaman yang sedang aktif.
            endPage = currentPage + halfLimit;
            // Mengatur halaman akhir supaya berakhir beberapa nomor setelah halaman yang sedang aktif.

            if (startPage < 1) {
                startPage = 1;
            // Jika halaman awal kurang dari 1, kembalikan ke 1 agar tidak keluar dari batas.
                endPage = maxPageButtons;
               // Jika digeser ke kiri, tombol akhir menyesuaikan tetap sebanyak 5 tombol. 
            }

            if (endPage > totalPages) {
                endPage = totalPages;
              // Jika halaman akhir melebihi total halaman yang ada, kembalikan ke halaman terakhir.  
                startPage = totalPages - maxPageButtons + 1;
                // Agar tetap 5 tombol, halaman awal dihitung mundur dari akhir.
            }
        }
        
        // Tombol SEBELUMNYA
        const prevBtn = document.createElement('button');
        // Membuat elemen tombol <button> untuk tombol "Sebelumnya".

        prevBtn.textContent = 'Sebelumnya';
        // Mengatur teks yang muncul pada tombol.
        prevBtn.classList.add('page-nav', 'prev');
        // Menambahkan class CSS agar tombol bisa diberi style khusus.
        prevBtn.disabled = currentPage === 1;
        // Jika sedang berada di halaman pertama, tombol dibuat tidak bisa diklik.
        if (currentPage > 1) {
            prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
            // Jika bukan halaman pertama, tombol bisa diklik untuk pindah ke halaman sebelumnya.
        }
        paginationControls.appendChild(prevBtn);
        // Menambahkan tombol "Sebelumnya" ke dalam area pagination di halaman.

        // Wadah Angka Halaman
        const pageNumbersDiv = document.createElement('div');
        // Membuat elemen <div> yang akan menjadi tempat semua nomor halaman.
        pageNumbersDiv.classList.add('page-numbers');
        // Menambahkan class CSS supaya div ini bisa di-style sebagai wadah nomor halaman.

        // Tombol '1' dan Elipsis Awal
        if (startPage > 1) {
            // Jika halaman pertama tidak termasuk dalam range tampilan (misal mulai dari halaman 3),
           // maka tombol halaman 1 perlu ditampilkan di depan.
            createPageButton(1, pageNumbersDiv);
            // Membuat tombol untuk halaman 1 dan menambahkannya ke wadah nomor halaman.
            if (startPage > 2) {
                appendEllipsis(pageNumbersDiv); 
               // Jika jarak antara halaman 1 dan startPage lebih dari 1 halaman,
              // tampilkan '...' untuk menandakan ada halaman yang dilewati. 
            }
        }

        // Tombol Halaman dalam Range
        for (let i = startPage; i <= endPage; i++) {
            createPageButton(i, pageNumbersDiv);
            // Loop dari halaman startPage sampai endPage untuk membuat tombol halaman satu per satu.
        // createPageButton(i) membuat tombol angka halaman dan menambahkannya ke pageNumbersDiv.
        }

        // Elipsis dan Tombol 'totalPages' Akhir
        if (endPage < totalPages) {
            // Mengecek apakah endPage masih kurang dari totalPages.
        // Jika iya, berarti masih ada halaman setelah range utama.
            if (endPage < totalPages - 1) {
                appendEllipsis(pageNumbersDiv); 
            }
            // Jika selisih antara endPage dan totalPages lebih dari 1 halaman,
            // maka tambahkan elipsis "..." sebagai penanda ada halaman yg terlewat.
            createPageButton(totalPages, pageNumbersDiv);
            // Tambahkan tombol halaman terakhir (totalPages).
        }
        
        paginationControls.appendChild(pageNumbersDiv);
        // Menambahkan div yang berisi semua tombol angka halaman ke elemen pagination utama.

        // Tombol SELANJUTNYA
        const nextBtn = document.createElement('button');
        // Membuat elemen tombol baru untuk tombol "Selanjutnya".
        nextBtn.textContent = 'Selanjutnya';
        // Menentukan teks yang tampil pada tombol.
        nextBtn.classList.add('page-nav', 'next');
        // Menambahkan class CSS agar tombol punya style khusus.
        nextBtn.disabled = currentPage === totalPages;
        // Jika halaman sekarang adalah halaman terakhir, tombol dinonaktifkan (tidak bisa diklik).

        if (currentPage < totalPages) {
            nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
        }
        // Jika belum berada di halaman terakhir, tombol diberi event klik
        // untuk pindah ke halaman berikutnya (currentPage + 1).
        paginationControls.appendChild(nextBtn);
        // Menambahkan tombol "Selanjutnya" ke dalam container pagination.
    }

    // ==========================
    // FUNGSI LOAD DATA (READ) DENGAN PAGINATION & SEARCH
    // ==========================
    async function loadBarangKeluar(page = 1, limit = currentLimit, searchTerm = '') {
    // Fungsi async untuk mengambil data barang keluar dari Supabase.
    // page = halaman sekarang, limit = jumlah data per halaman, searchTerm = kata pencarian.
        const startIndex = (page - 1) * limit;
        // Menghitung index awal data berdasarkan halaman.
        const endIndex = startIndex + limit - 1;
        // Menghitung index akhir data.

        // Query utama dengan relasi ke data_barang dan count
        let query = supabase
            .from("barang_keluar")
            .select(`*, data_barang!inner(nama_barang, kode_barang)`, { count: 'exact' });
            // select() mengambil semua kolom + relasi inner join ke data_barang.
    // count:'exact' digunakan untuk menghitung total data hasil filter.


        if (searchTerm) {
            const searchPattern = `%${searchTerm}%`;
            // Membuat pola pencarian menggunakan wildcard.
            query = query.or(
                `data_barang.nama_barang.ilike.${searchPattern}, data_barang.kode_barang.ilike.${searchPattern}`
            );
            // Mencari berdasarkan nama_barang ATAU kode_barang yang mirip (ilike = tidak case sensitive).
        }

        const { data, error, count: totalRowsFiltered } = await query
            .order("tanggal", { ascending: false })
            // Mengurutkan data berdasarkan tanggal terbaru.

            .range(startIndex, endIndex);
            // Mengambil data sesuai batas index (pagination).

        if (error) {
            console.error("❌ Gagal memuat data:", error);
             // Menampilkan error di console jika query gagal.
            tableBody.innerHTML = `<tr><td colspan="6">Gagal memuat data 😢</td></tr>`;
            // Menampilkan pesan error di tabel.
            return;
            // Menghentikan fungsi agar tidak melanjutkan proses.
        }

        tableBody.innerHTML = "";
        // Mengosongkan isi tabel sebelum menampilkan data baru.
        
        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6">Belum ada data barang keluar.</td></tr>`;
            // Jika data kosong, tampilkan pesan tidak ada data.
            totalBarangElement.textContent = "0";
            // Mengatur total barang menjadi 0.

            updatePaginationControls(0);
             // Pagination direset karena tidak ada data.
            return;
        }

        // Dapatkan Total Barang Keluar Global (untuk kartu summary)
        let totalKeluar = 0;
        const { data: allData, error: totalError } = await supabase.from("barang_keluar").select(`jumlah_keluar`);
         if (allData && !totalError) {
            totalKeluar = allData.reduce((sum, item) => sum + (item.jumlah_keluar || 0), 0);
         }
        

        data.forEach((item) => {
            const tanggal = item.tanggal ? new Date(item.tanggal) : null;
            const tanggalFormat = tanggal ? tanggal.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "N/A";
            const waktuFormat = tanggal ? tanggal.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(/\./g, ':') : "00:00";
            const jumlah = item.jumlah_keluar || 0;

            const kodeBarang = item.data_barang?.kode_barang || item.kode_barang || "-";
            const namaBarang = item.data_barang?.nama_barang || item.nama_barang || "-";
            
            const row = `
            <tr>
                <td>${kodeBarang}</td>
                <td>${namaBarang}</td>
                <td><span class="date-highlight">${tanggalFormat}</span></td>
                <td>${waktuFormat}</td>
                <td>${jumlah}</td>
                <td class="action-col">
                    <img src="../assets/gambar/icons/edit.png" alt="Edit" class="action-icon open-edit-modal" data-id="${item.id_barangkeluar}">
                    <img src="../assets/gambar/icons/delete.png" alt="Delete" class="action-icon open-delete-modal" data-id="${item.id_barangkeluar}">
                </td>
            </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

        // Tampilkan total barang keluar global
        totalBarangElement.textContent = totalKeluar.toLocaleString("id-ID");
        
        // Update kontrol pagination berdasarkan jumlah baris yang difilter/dicari
        updatePaginationControls(totalRowsFiltered || 0); 
    }
    
    // ==========================
    // FUNGSI TAMBAH BARANG (CREATE)
    // ==========================
    // Catatan: Asumsi fungsi 'combineDateTime' dan 'closeModal' tersedia di assets/js/barangkeluar.js atau global
    async function handleAddSubmit(event) {
        // Fungsi untuk menangani submit form tambah barang keluar.
        event.preventDefault();
        // Mencegah form melakukan reload halaman.
        
        const kode = document.getElementById('add-kode').value;
        // Mengambil nilai kode barang dari input.
        const nama = document.getElementById('add-nama').value;
        // Mengambil nilai nama barang dari input.
        const tanggal = document.getElementById('add-tanggal').value;
        // Mengambil tanggal dari input.
        const waktu = document.getElementById('add-waktu').value;
         // Mengambil waktu dari input.
        const jumlah = parseInt(document.getElementById('add-jumlah').value) || 0;
        // Mengambil jumlah barang keluar, dan memastikan nilainya angka (default 0 kalau tidak valid).

        const timestamp = combineDateTime(tanggal, waktu); 
        // Menggabungkan tanggal + waktu menjadi format datetime (misal: 2025-01-01 10:00).

        const { error } = await supabase
            .from('barang_keluar')
            // Mengakses tabel barang_keluar.
            .insert([{
                kode_barang: kode,
                // Mengisi kolom kode_barang.
                nama_barang: nama,
                // Mengisi kolom nama_barang.
                tanggal: timestamp,
                // Mengisi kolom tanggal dengan hasil gabungan date+time.

                jumlah_keluar: jumlah
                 // Mengisi kolom jumlah_keluar.
            }]);
            // Mengirim data baru ke database dengan method insert().

        if (error) {
            // Mengecek apakah proses insert ke Supabase gagal.
            console.error("Gagal menambah data:", error);
            // Menampilkan error detail di console untuk debugging.
            alert(`GAGAL MENAMBAH DATA:\n${error.message}`);
            // Menampilkan pesan gagal ke pengguna.

        } else {
              // Jika tidak ada error (berhasil menambah data).
            document.getElementById('add-form').reset();
            // Mengosongkan semua input form setelah data berhasil ditambah.
            closeModal(); 
             // Menutup modal tambah data.
            currentPage = 1;
            // Setelah tambah data, kembali ke halaman 1 supaya data baru langsung terlihat.
            loadBarangKeluar(currentPage, currentLimit, searchInput.value.trim()); 
            // Memuat ulang tabel barang keluar dengan data terbaru.
        }
    }

    // ==========================
    // FUNGSI EDIT BARANG (UPDATE)
    // ==========================
    async function handleEditSubmit(event) {
        // Fungsi untuk menangani proses edit data barang keluar.

        event.preventDefault();
        // Mencegah form melakukan reload halaman.

        const id = document.getElementById('edit-id').value; 
        // Mengambil ID barang yang akan diedit (ID ini disimpan saat tombol edit diklik).
        if (!id) {
            // Jika ID kosong, artinya data tidak valid.
            alert("ID barang tidak ditemukan, tidak bisa mengedit.");
            // Menampilkan peringatan ke user.

            return;
            // Menghentikan proses edit.
        }
        
        const kode = document.getElementById('edit-kode').value;
        // Mengambil input kode barang baru.
        const nama = document.getElementById('edit-nama').value;
        // Mengambil input nama barang baru.
        const tanggal = document.getElementById('edit-tanggal').value;
        // Mengambil tanggal baru dari input.
        const waktu = document.getElementById('edit-waktu').value;
        // Mengambil waktu baru dari input.
        const jumlah = parseInt(document.getElementById('edit-jumlah').value) || 0;
        // Mengambil jumlah baru, pastikan berupa angka (default = 0).
        const timestamp = combineDateTime(tanggal, waktu);
         // Menggabungkan tanggal + waktu menjadi format datetime valid.

        const { error } = await supabase
            .from('barang_keluar')
            // Mengakses tabel barang_keluar.
            .update({
                kode_barang: kode,
                // Update kolom kode_barang.
                nama_barang: nama,
                // Update kolom nama_barang.
                tanggal: timestamp,
                 // Update kolom tanggal.

                jumlah_keluar: jumlah
                // Update kolom jumlah_keluar.
            })
            .eq('id_barangkeluar', id); 
            // Menentukan baris yang ingin diperbarui sesuai ID.

        if (error) {
            // Jika terjadi kesalahan saat update.

            console.error("Gagal mengedit data:", error);
             // Tampilkan error ke console untuk debugging.
            alert(`GAGAL MENGEDIT DATA:\n${error.message}`);
            // Menampilkan pesan error ke user.
        } else {
            closeModal(); 
            // Menutup modal setelah data berhasil diupdate.
            loadBarangKeluar(currentPage, currentLimit, searchInput.value.trim()); 
            // Reload tabel agar data terbaru muncul di tampilan.
        }
    }

    // ==========================
    // FUNGSI HAPUS BARANG (DELETE)
    // ==========================
    async function handleDelete(id) {
        // Fungsi untuk menghapus data barang keluar berdasarkan ID.
        if (!id) {
            // Mengecek apakah ID valid.
            console.error("ID barang tidak ditemukan.");
            // Menampilkan pesan error di console.
            return;
             // Menghentikan proses penghapusan.
        }

        const { error } = await supabase
            .from('barang_keluar')
            // Mengakses tabel barang_keluar.
            .delete()
             // Menjalankan perintah delete pada tabel.

            .eq('id_barangkeluar', id); 
            // Menghapus data pada baris yang ID-nya sesuai.

        if (error) {
            // Jika Supabase mengembalikan error.
            console.error("Gagal menghapus data:", error);
            // Menampilkan error detail untuk debugging.
            alert(`GAGAL MENGHAPUS DATA:\n${error.message}`);
            // Memberi tahu user bahwa penghapusan gagal.
        } else {
            closeModal(); 
            // Menutup modal setelah penghapusan berhasil.
            loadBarangKeluar(currentPage, currentLimit, searchInput.value.trim()); 
            // Memuat ulang tabel agar perubahan langsung terlihat.
            
        }    
    }

    // ==========================
    // EVENT LISTENER UNTUK PAGINATION (LIHAT N)
    // ==========================
    rowsPerPageSelect.addEventListener('change', async () => {
     // Event ketika user mengubah jumlah baris per halaman.  
        currentLimit = parseInt(rowsPerPageSelect.value);
        // Mengambil nilai baru (misal: 5, 10, 20) dan mengubah batas baris per halaman.

        currentPage = 1; 
        // Reset ke halaman 1 setiap kali limit berubah.
        await loadBarangKeluar(currentPage, currentLimit, searchInput.value.trim());
        // Memuat ulang data dengan limit baru.
    });

    // ==========================
    // EVENT LISTENER UNTUK PENCARIAN (CARI)
    // ==========================
    searchInput.addEventListener('input', async () => {
         // Event ketika user mengetik sesuatu di kolom pencarian.
        const searchTerm = searchInput.value.trim();
        // Mengambil kata kunci yang sedang diketik.
        currentPage = 1; 
        // Selalu kembali ke halaman pertama saat melakukan pencarian.
        await loadBarangKeluar(currentPage, currentLimit, searchTerm);
        // Memuat ulang data berdasarkan kata pencarian.
    });

    // ==========================
    // INISIALISASI
    // ==========================
    const addForm = document.getElementById("add-form");
    // Mengambil elemen form tambah data.
    if (addForm) addForm.addEventListener("submit", handleAddSubmit);
    // Jika form tersedia, jalankan handleAddSubmit saat di-submit.
    const editForm = document.getElementById("edit-form");
    // Mengambil elemen form edit data.

    if (editForm) editForm.addEventListener("submit", handleEditSubmit);
    // Jika form tersedia, jalankan handleEditSubmit saat di-submit.
    
    await loadBarangKeluar(currentPage, currentLimit, searchInput.value.trim());
     // Memuat data pertama kali saat halaman dibuka (default halaman 1, limit awal).
});