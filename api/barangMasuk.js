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
    // (Asumsi ID HTML sama dengan Barang Keluar)
    // ==========================
    const tableBody = document.getElementById("table-body");
    // Mengambil elemen <tbody> tempat data tabel akan ditampilkan.
    const rowsPerPageSelect = document.getElementById("rows-per-page"); 
    // Mengambil elemen dropdown yang menentukan jumlah baris per halaman.
    const searchInput = document.getElementById("searchInput"); 
    // Mengambil input pencarian untuk memfilter data.
    const paginationControls = document.getElementById("pagination-controls"); 
    // Mengambil elemen pembungkus tombol pagination (prev, next, nomor halaman).
    const totalBarangElement = document.getElementById("total-barang"); 
    // Total stok barang (atau total barang masuk? Asumsi Total Barang Masuk)

    if (!tableBody || !rowsPerPageSelect || !searchInput || !paginationControls || !totalBarangElement) {
    // Mengecek apakah semua elemen penting pada tabel tersedia di halaman.
   // Jika salah satu elemen tidak ditemukan, tampilkan error di console.
        console.error("Error: Salah satu elemen kontrol tabel (tbody, select, input search, atau pagination) tidak ditemukan. Pastikan ID HTML sudah benar!");
        // Menampilkan pesan error di console agar developer tahu ada elemen HTML yang belum sesuai ID-nya.
        return; 
        // Menghentikan eksekusi function untuk mencegah error lanjutan.
    }

    let currentPage = 1;
    // Menyimpan nomor halaman yang sedang aktif, dimulai dari halaman 1.
    let currentLimit = parseInt(rowsPerPageSelect.value || '10'); 
    // Mengambil nilai limit (jumlah data per halaman) dari dropdown rowsPerPageSelect.
   // Jika tidak ada nilai, default-nya '10'. Lalu parse menjadi angka integer.

    // --- Helper Function untuk Pindah Halaman ---
    async function goToPage(page) {
         // Fungsi untuk pindah ke halaman tertentu

        const { count: totalRows } = await supabase.from("barang_masuk").select(`id_barangmasuk`, { count: 'exact' });
        // Mengambil total jumlah baris di tabel "barang_masuk"


        const totalPages = Math.ceil(totalRows / currentLimit);
         // Menghitung total halaman berdasarkan total data & limit

        if (page < 1 || page > totalPages) return;
        // Jika halaman yang diminta tidak valid → hentikan

        currentPage = page;
         // Set halaman aktif ke halaman yang dipilih
        await loadBarangMasuk(currentPage, currentLimit, searchInput.value.trim());
        // Muat ulang data tabel sesuai halaman, limit, dan pencarian 
    }

    // --- Fungsi Pembantu Pagination: Membuat Tombol Angka ---
    function createPageButton(pageNumber, container) {
        // Membuat tombol halaman berdasarkan nomor halaman
        const pageBtn = document.createElement('span');
        // Membuat elemen <span> untuk tombol halaman
        pageBtn.textContent = String(pageNumber).padStart(2, '0');
         // Menampilkan nomor halaman, dipaksa 2 digit (01, 02, 03)
        
        if (pageNumber === currentPage) {
            // Jika tombol ini adalah halaman yang sedang aktif
            pageBtn.classList.add('active'); 
            
        } else {
            pageBtn.addEventListener('click', () => goToPage(pageNumber));
            // Jika bukan halaman aktif → klik untuk pindah halaman
        }
        container.appendChild(pageBtn);
        // Tambahkan tombol halaman ke dalam container pagination
    }

    // --- Fungsi Pembantu Pagination: Menambahkan Elipsis (...) ---
    function appendEllipsis(container) {
        // Fungsi untuk menambahkan tanda "..." pada pagination
        const ellipsis = document.createElement('span');
        // Membuat elemen <span> untuk elipsis
        ellipsis.textContent = '...';
        // Isi teks "..." untuk menunjukkan ada halaman yang dilewati
        ellipsis.style.padding = '0 5px';
        // Memberi jarak kiri–kanan agar tidak terlalu rapat
        ellipsis.style.pointerEvents = 'none'; 
        // Menonaktifkan klik pada elipsis (hanya dekorasi)
        ellipsis.style.opacity = '0.7'; 
        // Membuat elipsis sedikit transparan agar tampak pasif
        container.appendChild(ellipsis);
        // Menambahkan elemen elipsis ke dalam container pagination
    }

    // --- Helper Function untuk Membuat Kontrol Pagination (Batasan 5 Tombol) ---
    function updatePaginationControls(totalRows) {
        // Fungsi untuk mengatur tampilan tombol pagination
        const totalPages = Math.ceil(totalRows / currentLimit);
        // Hitung total halaman berdasarkan total data & limit
        paginationControls.innerHTML = ''; 
        // Hapus semua tombol pagination sebelumnya

        if (totalRows === 0 || totalPages <= 1) {
        // Kalau tidak ada data atau hanya 1 halaman
            paginationControls.innerHTML = '';
            // Tidak perlu tampilkan tombol halaman
            return; 
              // Keluar dari fungsi
        }

        const maxPageButtons = 5; 
        // Maksimal jumlah tombol angka yang ditampilkan
        let startPage, endPage;
        // Variabel untuk menyimpan batas awal & akhir tombol halaman

        if (totalPages <= maxPageButtons) {
            // Jika total halaman tidak melebihi batas 5 tombol
            startPage = 1;
            // Tombol dimulai dari halaman 1
            endPage = totalPages;
            // Sampai halaman terakhir
        } else {
            // Jika total halaman lebih dari 5
            const halfLimit = Math.floor(maxPageButtons / 2);
             // Hitung jarak kiri-kanan tombol aktif dari titik tengah
            startPage = currentPage - halfLimit;
            // Tentukan halaman awal
            endPage = currentPage + halfLimit;
            // Tentukan halaman akhir

            if (startPage < 1) {
                // Jika perhitungan menyebabkan startPage di bawah 1
                startPage = 1;
                // Mulai dari halaman 1
                endPage = maxPageButtons;
                // Tampilkan hanya 5 halaman pertama
            }

            if (endPage > totalPages) {
                // Jika endPage lebih besar dari total halaman
                endPage = totalPages;
                // Set ke halaman terakhir
                startPage = totalPages - maxPageButtons + 1;
                // Geser startPage agar tetap 5 tombol ditampilkan
            }
        }
        
        // Tombol SEBELUMNYA
        const prevBtn = document.createElement('button');
        // Buat tombol baru
        prevBtn.textContent = 'Sebelumnya';
        // Tulis teks "Sebelumnya" di tombol
        prevBtn.classList.add('page-nav', 'prev');
        // Tambahkan class untuk styling tombol
        prevBtn.disabled = currentPage === 1;
         // Nonaktifkan tombol kalau sedang di halaman 1
        if (currentPage > 1) {
            // Kalau bukan halaman pertama
            prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
            // Klik tombol untuk pindah ke halaman sebelumnya
        }
        paginationControls.appendChild(prevBtn);
        // Tambahkan tombol ke container pagination

        // Wadah Angka Halaman
        const pageNumbersDiv = document.createElement('div');
         // Buat elemen <div> untuk menampung tombol nomor halaman
        pageNumbersDiv.classList.add('page-numbers');
        // Tambahkan class untuk styling

        // Tombol '1' dan Elipsis Awal
        if (startPage > 1) {
            // Kalau halaman awal yang ditampilkan bukan halaman 1
            createPageButton(1, pageNumbersDiv);
            // Buat tombol halaman 1
            if (startPage > 2) {
                // Kalau ada lebih dari 1 halaman di antara tombol 1 dan startPage
                appendEllipsis(pageNumbersDiv); 
                // Tambahkan "..." untuk menunjukkan halaman yang dilewati
            }
        }

        // Tombol Halaman dalam Range
        for (let i = startPage; i <= endPage; i++) {
            // Loop dari startPage sampai endPage
            createPageButton(i, pageNumbersDiv);
            // Buat tombol untuk setiap nomor halaman
        }

        // Elipsis dan Tombol 'totalPages' Akhir
        if (endPage < totalPages) {
            // Jika halaman terakhir yang ditampilkan belum sampai totalPages
            if (endPage < totalPages - 1) {
                // Kalau masih ada lebih dari 1 halaman di antara endPage dan totalPages
                appendEllipsis(pageNumbersDiv); 
                 // Tambahkan "..." untuk menunjukkan halaman yang dilewati
            }
            createPageButton(totalPages, pageNumbersDiv);
            // Buat tombol untuk halaman terakhir
            
        }
        
        paginationControls.appendChild(pageNumbersDiv);
        // Tambahkan semua tombol halaman ke container pagination

        // Tombol SELANJUTNYA
        const nextBtn = document.createElement('button');
        // Buat tombol baru
        nextBtn.textContent = 'Selanjutnya';
        // Tulis teks "Selanjutnya" di tombol
        nextBtn.classList.add('page-nav', 'next');
        // Tambahkan class untuk styling tombol
        nextBtn.disabled = currentPage === totalPages;
        // Nonaktifkan tombol kalau sedang di halaman terakhir
        if (currentPage < totalPages) {
            // Kalau bukan halaman terakhir
            nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
            // Klik tombol untuk pindah ke halaman berikutnya
        }
        paginationControls.appendChild(nextBtn);
        // Tambahkan tombol ke container pagination
    }
    
    // Helper untuk format rupiah
    function formatRupiah(number) {
    // Fungsi untuk mengubah angka menjadi format ribuan Indonesia
        return new Intl.NumberFormat('id-ID').format(number);
        // Format angka (contoh: 10000 → 10.000)
    }

    // ==========================
    // FUNGSI LOAD DATA (READ) DENGAN PAGINATION & SEARCH
    // ==========================
    async function loadBarangMasuk(page = 1, limit = currentLimit, searchTerm = '') {
     // Fungsi utama untuk mengambil dan menampilkan data barang masuk dari database   
        const startIndex = (page - 1) * limit;
        // Hitung index awal data yang akan diambil (misalnya page 2, limit 10 → mulai dari index 10)
        const endIndex = startIndex + limit - 1;
         // Hitung index akhir data (misalnya start 10 + limit 10 - 1 = 19 → ambil data sampai index 19)

        // Query utama: Mengambil data barang_masuk dan menggabungkan dengan data_barang (untuk nama barang)
        let query = supabase
        // Membuat variabel query untuk mengambil data dari Supabase
            .from("barang_masuk")
            // Mengambil data dari tabel "barang_masuk"

            .select(`
                *, 
                data_barang!inner(nama_barang, kode_barang)
            `, { count: 'exact' });
            // Memilih semua kolom + join tabel data_barang dan meminta Supabase menghitung jumlah datanya

        if (searchTerm) {
            // Mengecek apakah ada kata pencarian
            const searchPattern = `%${searchTerm}%`;
            // Cari berdasarkan kode barang atau nama barang
            query = query.or(
                `data_barang.nama_barang.ilike.${searchPattern}, data_barang.kode_barang.ilike.${searchPattern}`
            );
            // Menambah filter pencarian berdasarkan nama_barang atau kode_barang
        }

        const { data, error, count: totalRowsFiltered } = await query
        // Menjalankan query yang sudah dibuat dan mengambil data, error, dan total row hasil filter
            .order("tanggal", { ascending: false }) 
            // Urutkan berdasarkan tanggal terbaru
            .range(startIndex, endIndex);
            // Mengambil data hanya pada range sesuai pagination (index awal sampai akhir)

        if (error) {
        // Mengecek apakah ada error saat mengambil data
            console.error("❌ Gagal memuat data barang masuk:", error);
        // Menampilkan error di console untuk debugging    
            tableBody.innerHTML = `<tr><td colspan="8">Gagal memuat data 😢</td></tr>`;
            // Menampilkan pesan error ke dalam tabel
            return;
            // Menghentikan fungsi jika terjadi error
        }

        tableBody.innerHTML = "";
        // Menghapus isi tabel agar bisa diisi data baru
        
        if (!data || data.length === 0) {
        // Mengecek apakah data kosong
            tableBody.innerHTML = `<tr><td colspan="8">Belum ada data barang masuk.</td></tr>`;
            // Tampilkan pesan bahwa tidak ada data
            totalBarangElement.textContent = "0";
            // Set jumlah total data menjadi 0

            updatePaginationControls(0);
            // Update pagination agar kosong
            return;
            // Keluar dari fungsi
        }

        // Dapatkan Total Barang Masuk Global (untuk kartu summary)
        let totalMasuk = 0;
        // Menyiapkan variabel untuk menyimpan total stok barang masuk
        const { data: allData, error: totalError } = await supabase.from("barang_masuk").select(`stok_barang`);
        // Mengambil semua stok_barang dari tabel barang_masuk untuk menghitung total barang masuk
         if (allData && !totalError) {
           // Mengecek apakah data berhasil diambil dan tidak error 
            totalMasuk = allData.reduce((sum, item) => sum + (item.stok_barang || 0), 0);
            // Menjumlahkan semua nilai stok_barang, jika null dianggap 0
         }
        

        data.forEach((item) => {
        // Melakukan perulangan untuk setiap item data yang akan ditampilkan di tabel 
            const tanggal = item.tanggal ? new Date(item.tanggal) : null;
            // Mengonversi tanggal database menjadi objek Date, jika tidak ada maka null
            const tanggalFormat = tanggal ? tanggal.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "N/A";
             // Memformat tanggal menjadi format Indonesia, contoh: "22 November 2025"
            const waktuFormat = tanggal ? tanggal.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(/\./g, ':') : "00:00";
            // Memformat waktu menjadi jam dan menit, serta mengganti titik menjadi titik dua
            
            const kodeBarang = item.data_barang?.kode_barang || "-";
            // Mengambil kode barang dari relasi data_barang, jika tidak ada tampil "-"

            const namaBarang = item.data_barang?.nama_barang || "-";
            // Mengambil nama barang dari relasi data_barang
            const merek = item.merek || "-";
            // Mengambil merek barang, jika kosong tampil "-"
            const hargaBeli = item.harga_beli || 0;
            // Harga beli default 0 jika nilai tidak ada
            const hargaJual = item.harga_jual || 0;
            // Harga jual default 0 jika nilai tidak ada
            const jumlah = item.stok_barang || 0;
             // Jumlah stok barang masuk
            
            const row = `
            <tr>
                <td>${kodeBarang}</td>
                // Menampilkan kode barang 
                <td>${namaBarang}</td>
                // Menampilkan nama barang
                <td><span class="date-highlight">${tanggalFormat}</span></td>
                // Menampilkan tanggal masuk barang 
                <td>${waktuFormat}</td>
                // Menampilkan waktu masuk barang
                <td>${merek}</td>
                // Menampilkan merek barang
                <td>${formatRupiah(hargaBeli)}</td>
                // Menampilkan harga beli dalam format rupiah
                <td>${formatRupiah(hargaJual)}</td>
                // Menampilkan harga jual dalam format rupiah
                <td>${jumlah}</td>
                // Menampilkan jumlah stok barang masuk
                <td class="action-col">
                // Kolom aksi untuk edit dan delete
                    <img src="../assets/gambar/icons/edit.png" alt="Edit" class="action-icon open-edit-modal" data-id="${item.id_barangmasuk}">
                    // Tombol untuk membuka modal edit
                    <img src="../assets/gambar/icons/delete.png" alt="Delete" class="action-icon open-delete-modal" data-id="${item.id_barangmasuk}">
                    // Tombol untuk membuka modal delete
                </td>
            </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
             // Menambahkan baris tabel ke dalam elemen tbody
        });

        totalBarangElement.textContent = totalMasuk.toLocaleString("id-ID");
        // Tampilkan total barang masuk global

        updatePaginationControls(totalRowsFiltered || 0); 
        // Update kontrol pagination berdasarkan jumlah baris yang difilter/dicari
    }

    // ==========================
    // FUNGSI TAMBAH BARANG (CREATE)
    // ==========================
    // Catatan: Asumsi form memiliki ID yang sesuai (add-form, add-kode, add-nama, dsb.)
    async function handleAddSubmit(event) {
        event.preventDefault();
        // Mencegah form melakukan reload halaman
        
        // Asumsi form input memiliki ID:
        const kode = document.getElementById('add-kode').value; 
        // Ambil kode barang dari input
        const nama = document.getElementById('add-nama').value;
        // Ambil nama barang dari input 
        const tanggal = document.getElementById('add-tanggal').value;
        // Mengambil tanggal dari form
        const waktu = document.getElementById('add-waktu').value;
        // Mengambil waktu dari form
        const merek = document.getElementById('add-merek').value;
        // Mengambil merek barang dari input
        const hargaBeli = parseInt(document.getElementById('add-harga-beli').value) || 0;
        // Mengambil harga beli dan mengubahnya menjadi angka, default 0 jika kosong
        const hargaJual = parseInt(document.getElementById('add-harga-jual').value) || 0;
        // Mengambil harga jual dan mengubahnya menjadi angka, default 0 jika kosong
        const jumlah = parseInt(document.getElementById('add-jumlah').value) || 0;
         // Mengambil jumlah barang masuk dan mengubahnya menjadi angka, default 0 jika kosong
        
        // Anda perlu mendapatkan id_barang dari Supabase berdasarkan kode atau nama barang
        // Ini membutuhkan fungsi helper terpisah untuk mencari id_barang
        // Untuk contoh ini, kita asumsikan id_barang adalah string yang perlu diisi (atau bisa dikesampingkan jika kode_barang/nama_barang cukup)
        const idBarang = 1; 
        // Menentukan id barang (sementara menggunakan nilai tetap 1)

        const timestamp = combineDateTime(tanggal, waktu); 
        // Menggabungkan tanggal dan waktu menjadi format datetime lengkap

        const { error } = await supabase
        // Menampung error jika terjadi saat proses insert
            .from('barang_masuk')
           // Menentukan tabel tempat data akan dimasukkan 
            .insert([{
                id_barang: idBarang, 
                // Mengirim id barang ke database
                kode_barang: kode, 
                // Mengirim kode barang (meski seharusnya cukup pakai id_barang)
                merek: merek,
                // Mengirim merek barang
                harga_beli: hargaBeli,
                // Mengirim harga beli
                harga_jual: hargaJual,
                // Mengirim harga jual
                tanggal: timestamp,
                // Mengirim tanggal + waktu dalam format lengkap
                stok_barang: jumlah 
                // Mengirim jumlah barang yang masuk
            }]);

        if (error) {
        // Mengecek apakah terjadi error saat insert
            console.error("Gagal menambah data barang masuk:", error);
             // Menampilkan error ke console
            alert(`GAGAL MENAMBAH DATA BARANG MASUK:\n${error.message}`);
            // Menampilkan pesan gagal ke user
        } else {
            // Jika insert berhasil
            document.getElementById('add-form').reset();
            // Mengosongkan semua input form
            closeModal(); 
            // Menutup modal form setelah berhasil menambah
            currentPage = 1;
            // Kembali ke halaman 1 setelah tambah data baru
            loadBarangMasuk(currentPage, currentLimit, searchInput.value.trim()); 
            // Reload ulang data tabel dengan data terbaru
        }
    }

    // ==========================
    // FUNGSI EDIT BARANG (UPDATE)
    // ==========================
    async function handleEditSubmit(event) {
        event.preventDefault();
        // Mencegah halaman reload saat form edit disubmit


        const id = document.getElementById('edit-id').value;
         // Mengambil ID barang masuk yang akan diedit
        if (!id) {
            alert("ID barang masuk tidak ditemukan, tidak bisa mengedit.");
            // Menampilkan pesan jika ID tidak ditemukan
            return;
            // Menghentikan proses edit karena ID tidak ada
        }
        
        // Asumsi form input memiliki ID:
        const merek = document.getElementById('edit-merek').value;
        // Mengambil merek barang dari input form edit
        const hargaBeli = parseInt(document.getElementById('edit-harga-beli').value) || 0;
        // Mengambil harga beli dan mengubahnya menjadi angka, default 0 jika kosong
        const hargaJual = parseInt(document.getElementById('edit-harga-jual').value) || 0;
        // Mengambil harga jual dan mengubahnya menjadi angka, default 0 jika kosong
        const tanggal = document.getElementById('edit-tanggal').value;
        // Mengambil tanggal dari input edit
        const waktu = document.getElementById('edit-waktu').value;
        // Mengambil waktu dari input edit
        const jumlah = parseInt(document.getElementById('edit-jumlah').value) || 0;
        // Mengambil jumlah stok barang masuk, default 0 jika kosong

        const timestamp = combineDateTime(tanggal, waktu); 
        // Menggabungkan tanggal dan waktu menjadi satu format datetime


        const { error } = await supabase
        // Menangkap error jika terjadi saat update data
            .from('barang_masuk')
             // Menentukan tabel barang_masuk
            .update({
                merek: merek,
                // Mengupdate merek barang
                harga_beli: hargaBeli,
                // Mengupdate harga beli
                harga_jual: hargaJual,
                // Mengupdate harga jual

                tanggal: timestamp,
                // Mengupdate tanggal dan waktu barang masuk

                stok_barang: jumlah
                // Mengupdate jumlah barang masuk
            })
            .eq('id_barangmasuk', id); 
            // Menentukan baris mana yang akan diupdate berdasarkan id

        if (error) {
            console.error("Gagal mengedit data barang masuk:", error);
            // Menampilkan error di console jika gagal update
            alert(`GAGAL MENGEDIT DATA BARANG MASUK:\n${error.message}`);
            // Menampilkan pesan gagal ke user
        } else {
            closeModal(); 
            // Menutup modal edit setelah berhasil
            loadBarangMasuk(currentPage, currentLimit, searchInput.value.trim()); 
             // Refresh tabel barang masuk agar data terbaru muncul
        }
    }

    // ==========================
    // FUNGSI HAPUS BARANG (DELETE)
    // ==========================
    async function handleDelete(id) {
        if (!id) {
            console.error("ID barang masuk tidak ditemukan.");
            // Menampilkan error jika ID tidak diberikan
            return;
            // Menghentikan proses delete karena tidak ada ID
        }

        const { error } = await supabase
        // Menangkap error jika terjadi saat proses delete
            .from('barang_masuk')
            // Menentukan tabel barang_masuk
            .delete()
            // Melakukan penghapusan data
            .eq('id_barangmasuk', id); 
             // Menghapus data berdasarkan id_barangmasuk tertentu

        if (error) {
            console.error("Gagal menghapus data barang masuk:", error);
            // Menampilkan error jika proses delete gagal
            alert(`GAGAL MENGHAPUS DATA BARANG MASUK:\n${error.message}`);
            // Memberi tahu user bahwa penghapusan gagal
        } else {
            closeModal(); 
            // Menutup modal delete setelah berhasil
            
            loadBarangMasuk(currentPage, currentLimit, searchInput.value.trim()); 
            // Refresh data tabel agar perubahan terlihat
        }
    }

    // ==========================
    // EVENT LISTENER UNTUK PAGINATION (LIHAT N)
    // ==========================
    rowsPerPageSelect.addEventListener('change', async () => {
        // Menjalankan fungsi ketika pilihan jumlah baris per halaman berubah
        currentLimit = parseInt(rowsPerPageSelect.value);
        // Mengubah batas jumlah data per halaman berdasarkan pilihan user
        currentPage = 1; 
        // Mengatur ulang ke halaman pertama setiap kali limit berubah
        await loadBarangMasuk(currentPage, currentLimit, searchInput.value.trim());
        // Memuat ulang data tabel dengan limit dan halaman baru
    });

    // ==========================
    // EVENT LISTENER UNTUK PENCARIAN (CARI)
    // ==========================
    searchInput.addEventListener('input', async () => {
        // Menjalankan fungsi ketika user mengetik di kolom pencarian

        const searchTerm = searchInput.value.trim();
        // Mengambil kata pencarian dan menghapus spasi di awal/akhir
        currentPage = 1; 
        // Mengatur ulang ke halaman pertama saat melakukan pencarian
        await loadBarangMasuk(currentPage, currentLimit, searchTerm);
         // Memuat ulang data berdasarkan kata pencarian
    });

    // ==========================
    // INISIALISASI
    // ==========================
    // Panggil fungsi add submit (Asumsi ID form adalah 'add-form')
    const addForm = document.getElementById("add-form");
     // Mencari elemen form tambah data berdasarkan ID
    if (addForm) addForm.addEventListener("submit", handleAddSubmit);
    // Jika form ditemukan, tambahkan event submit untuk menjalankan fungsi tambah data

    // Panggil fungsi edit submit (Asumsi ID form adalah 'edit-form')
    const editForm = document.getElementById("edit-form");
    // Mencari elemen form edit data berdasarkan ID
    if (editForm) editForm.addEventListener("submit", handleEditSubmit);
     // Jika form ditemukan, tambahkan event submit untuk menjalankan fungsi edit data
    
    await loadBarangMasuk(currentPage, currentLimit, searchInput.value.trim()); 
    // Memuat data tabel pertama kali saat halaman dibuka
});