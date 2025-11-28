const API_BASE = "http://localhost:3000";
const API_DASHBOARD = "http://localhost:4000/api/dasboard";

// === Fungsi Fetch Data ===
async function getData(endpoint) {
  const res = await fetch(`${API_BASE}/${endpoint}`);
  if (!res.ok) throw new Error("Gagal memuat data: " + endpoint);
  return await res.json();
}

// === Fungsi utama Load Dashboard ===
async function loadDashboard() {
  try {
    // Ambil ringkasan data dari API 3000
    const [barang, masuk, keluar] = await Promise.all([
      getData("databarang"),
      getData("barangmasuk"),
      getData("barangkeluar")
    ]);

    // Tampilkan ringkasan angka
    document.querySelectorAll(".stat-number")[0].textContent = barang.length;
    document.querySelectorAll(".stat-number")[1].textContent = masuk.length;
    document.querySelectorAll(".stat-number")[2].textContent = keluar.length;

    // Ambil tabel untuk isi data
    const tableMasukBody = document.querySelector(".dashboard-table:nth-of-type(1) tbody");
    const tableKeluarBody = document.querySelector(".dashboard-table:nth-of-type(2) tbody");

    // Kosongkan tabel
    tableMasukBody.innerHTML = "";
    tableKeluarBody.innerHTML = "";

    // Ambil data dari API 4000 (digabung jadi satu array)
    const res = await fetch(API_DASHBOARD);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Data tidak valid dari API 4000");

    // Barang Masuk = 5 pertama
    data.slice(0, 5).forEach((item, index) => {
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${item.nama_barang}</td>
          <td><span class="date-highlight">${new Date(item.tanggal).toLocaleString("id-ID")}</span></td>
          <td class="jumlah"><span class="quantity-green">${item.jumlah}</span></td>
        </tr>
      `;
      tableMasukBody.insertAdjacentHTML("beforeend", row);
    });

    // Barang Keluar = 5 berikutnya
    data.slice(5, 10).forEach((item, index) => {
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${item.nama_barang}</td>
          <td><span class="date-highlight">${new Date(item.tanggal).toLocaleString("id-ID")}</span></td>
          <td class="jumlah"><span class="quantity-red">${item.jumlah}</span></td>
        </tr>
      `;
      tableKeluarBody.insertAdjacentHTML("beforeend", row);
    });

  } catch (err) {
    console.error("Error Dashboard:", err);
  }
}

// === Jalankan hanya sekali ===
document.addEventListener("DOMContentLoaded", loadDashboard);
