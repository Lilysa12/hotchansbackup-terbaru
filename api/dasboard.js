// ===============================
// KONFIGURASI SUPABASE (TANPA IMPORT)
// ===============================
const SUPABASE_URL = "https://cwvcprzdovbpteiuuvgj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmNwcnpkb3ZicHRlaXV1dmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzEwODYsImV4cCI6MjA3ODM0NzA4Nn0.Poi74Rm2rWUWGeoUTmP2CR5zlT_YqnY9j_OdjVz3tFw";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===============================
// 1. KARTU STATISTIK DASHBOARD
// ===============================
async function loadStats() {
  try {
    const { data: masukData, error: masukError } = await supabase
      .from("barang_masuk")
      .select("stok_barang");

    if (masukError) throw masukError;

    const totalMasuk = masukData.reduce(
      (sum, x) => sum + (x.stok_barang || 0),
      0
    );

    const { data: keluarData, error: keluarError } = await supabase
      .from("barang_keluar")
      .select("jumlah_keluar");

    if (keluarError) throw keluarError;

    const totalKeluar = keluarData.reduce(
      (sum, x) => sum + (x.jumlah_keluar || 0),
      0
    );

    const totalBarang = totalMasuk - totalKeluar;

    document.getElementById("total-barang").textContent = totalBarang;
    document.getElementById("total-masuk").textContent = totalMasuk;
    document.getElementById("total-keluar").textContent = totalKeluar;

  } catch (e) {
    console.error("Gagal memuat data statistik:", e.message);
  }
}

// ===============================
// 2. TABEL BARANG MASUK
// ===============================
async function loadBarangMasuk(page = 1, limit = 5) {
  currentPageMasuk = page;
  rowsPerPageMasuk = limit;

  const rangeFrom = (page - 1) * limit;
  const rangeTo = rangeFrom + limit - 1;

  const body = document.querySelector("#tabelMasuk tbody");
  body.innerHTML = `<tr><td colspan="4" style="text-align:center;">Memuat...</td></tr>`;

  const { data, error, count } = await supabase
    .from("barang_masuk")
    .select("id_barang, tanggal, stok_barang, data_barang(kode_barang, nama_barang)", { count: "exact" })
    .order("tanggal", { ascending: false })
    .range(rangeFrom, rangeTo);

  if (error) {
    body.innerHTML = `<tr><td colspan="4">Gagal memuat data.</td></tr>`;
    return;
  }

  body.innerHTML = "";

  data.forEach((item) => {
    body.innerHTML += `
      <tr>
        <td>${item.data_barang.kode_barang}</td>
        <td>${item.data_barang.nama_barang}</td>
        <td>${new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
        <td style="color:green;">${item.stok_barang}</td>
      </tr>
    `;
  });

  updatePagination("Masuk", count, page, limit);
}

// ===============================
// 3. TABEL BARANG KELUAR
// ===============================
async function loadBarangKeluar(page = 1, limit = 5) {
  currentPageKeluar = page;
  rowsPerPageKeluar = limit;

  const rangeFrom = (page - 1) * limit;
  const rangeTo = rangeFrom + limit - 1;

  const body = document.querySelector("#tabelKeluar tbody");
  body.innerHTML = `<tr><td colspan="4" style="text-align:center;">Memuat...</td></tr>`;

  const { data, error, count } = await supabase
    .from("barang_keluar")
    .select("id_barang, tanggal, jumlah_keluar, data_barang(kode_barang, nama_barang)", { count: "exact" })
    .order("tanggal", { ascending: false })
    .range(rangeFrom, rangeTo);

  if (error) {
    body.innerHTML = `<tr><td colspan="4">Gagal memuat data.</td></tr>`;
    return;
  }

  body.innerHTML = "";

  data.forEach((item) => {
    body.innerHTML += `
      <tr>
        <td>${item.data_barang.kode_barang}</td>
        <td>${item.data_barang.nama_barang}</td>
        <td>${new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
        <td style="color:red;">${item.jumlah_keluar}</td>
      </tr>
    `;
  });

  updatePagination("Keluar", count, page, limit);
}

// ===============================
// 5. START
// ===============================
let currentPageMasuk = 1;
let rowsPerPageMasuk = 5;

let currentPageKeluar = 1;
let rowsPerPageKeluar = 5;

document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadBarangMasuk();
  loadBarangKeluar();
});
