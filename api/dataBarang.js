// ====== Konfigurasi Supabase ======
const SUPABASE_URL = "https://cwvcprzdovbpteiuuvgj.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmNwcnpkb3ZicHRlaXV1dmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzEwODYsImV4cCI6MjA3ODM0NzA4Nn0.Poi74Rm2rWUWGeoUTmP2CR5zlT_YqnY9j_OdjVz3tFw";
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ====== Ambil elemen penting ======
const tableBody = document.getElementById("dataTableBody");
const searchInput = document.getElementById("searchInput");

const editModal = document.getElementById("edit-modal");
const deleteModal = document.getElementById("delete-modal");
const editForm = document.getElementById("editForm");
const confirmDeleteButton = document.getElementById("confirmDelete");

const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const pageNumbersContainer = document.getElementById("pageNumbers");
const limitSelect = document.getElementById("limitSelect");

let currentPage = 1;
let rowsPerPage = 10;
let currentFilter = "";
let totalRows = 0;

// ====== Fungsi Utama: Ambil dan Tampilkan Data ======
async function loadData(page = 1, filter = "", limit = 10) {
  currentPage = page;
  currentFilter = filter;
  rowsPerPage = limit;

  const rangeFrom = (page - 1) * rowsPerPage;
  const rangeTo = page * rowsPerPage - 1;

  try {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px;">Memuat data...</td></tr>`;

  let query = supabase
  .from("data_barang")
  .select("*", { count: "exact" })
  .order("id_barang", { ascending: true }) 
  .range(rangeFrom, rangeTo);

    if (filter) {
      query = query.ilike("nama_barang", `%${filter}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    if (!filter) {
      totalRows = count;
    }

    tableBody.innerHTML = ""; 

    if (!data || data.length === 0) {
      tableBody.innerHTML = `
        <tr><td colspan="8" style="text-align:center; padding: 20px;">Tidak ada data ditemukan</td></tr>
      `;
      updatePagination(count); 
      return;
    }

    data.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.kode_barang || "-"}</td>
        <td>${item.nama_barang || "-"}</td>
        <td><span class="date-highlight">
          ${item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID") : "-"}
        </span></td>
        <td>${item.merek || "-"}</td>
        <td>${item.harga_beli?.toLocaleString("id-ID") || "-"}</td>
        <td>${item.harga_jual?.toLocaleString("id-ID") || "-"}</td>
        <td>${item.stok_barang ?? 0}</td>
        <td class="aksi">
          <button class="btn-edit" data-id="${item.kode_barang}">
            <img src="../assets/gambar/icons/edit.png" alt="Edit">
          </button>
          <button class="btn-delete" data-id="${item.kode_barang}">
            <img src="../assets/gambar/icons/delete.png" alt="Hapus">
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    updatePagination(count);

  } catch (err) {
    console.error("Gagal ambil data:", err.message);
    tableBody.innerHTML = `
      <tr><td colspan="8" style="text-align:center; padding: 20px;">Gagal mengambil data: ${err.message}</td></tr>
    `;
  }
}

// ====== Fungsi: Update Pagination UI (Logika 4 halaman) ======
function updatePagination(totalCount) {
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  pageNumbersContainer.innerHTML = ""; 

  prevPageButton.disabled = (currentPage === 1);
  nextPageButton.disabled = (currentPage === totalPages || totalPages === 0);

  const maxPagesToShow = 4;
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > maxPagesToShow) {
    startPage = Math.max(1, currentPage - 1); 
    endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageSpan = document.createElement("span");
    pageSpan.textContent = i < 10 ? `0${i}` : i;
    if (i === currentPage) {
      pageSpan.classList.add("active");
    }
    pageSpan.addEventListener("click", () => {
      if (i !== currentPage) {
        loadData(i, currentFilter, rowsPerPage);
      }
    });
    pageNumbersContainer.appendChild(pageSpan);
  }
}

// ====== Fungsi: Edit Data (Tidak berubah) ======
async function handleEditData(event) {
  event.preventDefault(); 
  
  const kode = document.getElementById("editKode").value;
  const nama = document.getElementById("editNama").value;
  const merek = document.getElementById("editMerek").value;
  const hargaBeli = document.getElementById("editHargaBeli").value;
  const hargaJual = document.getElementById("editHargaJual").value;
  const stok = document.getElementById("editStok").value;

  try {
    const { error } = await supabase
      .from("data_barang")
      .update({ 
        nama_barang: nama,
        merek: merek,
        harga_beli: hargaBeli,
        harga_jual: hargaJual,
        stok_barang: stok
      })
      .eq("id_barang", kode); 

    if (error) throw error;

    alert("Data berhasil diperbarui!");
    window.closeModal(editModal); 
    loadData(currentPage, currentFilter, rowsPerPage); 
  
  } catch (err) {
    console.error("Gagal update data:", err.message);
    alert("Gagal memperbarui data: " + err.message);
  }
}

// ====== Fungsi: Hapus Data (Tidak berubah) ======
async function handleDeleteData() {
  const id = confirmDeleteButton.dataset.id; 

  try {
    const { error } = await supabase
      .from("data_barang")
      .delete()
      .eq("kode_barang", id); 

    if (error) throw error;

    alert("Data berhasil dihapus!");
    window.closeModal(deleteModal); 
    loadData(1, "", rowsPerPage); 
  
  } catch (err) {
    console.error("Gagal hapus data:", err.message);
    alert("Gagal menghapus data: " + err.message);
  }
}


// ====== Event Listeners (Tidak berubah) ======
document.addEventListener("DOMContentLoaded", () => {
  loadData(currentPage, currentFilter, rowsPerPage);

  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    const keyword = e.target.value.trim();
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadData(1, keyword, rowsPerPage); 
    }, 300); 
  });

  limitSelect.addEventListener("change", (e) => {
    const newLimit = parseInt(e.target.value, 10);
    loadData(1, currentFilter, newLimit); 
  });

  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      loadData(currentPage - 1, currentFilter, rowsPerPage);
    }
  });

  nextPageButton.addEventListener("click", () => {
    loadData(currentPage + 1, currentFilter, rowsPerPage);
  });

  if (editForm) {
    editForm.addEventListener("submit", handleEditData);
  }
  
  if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener("click", handleDeleteData);
  }
});