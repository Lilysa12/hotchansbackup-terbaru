// frontend/assets/js/dashboard.js

const API_BASE = "http://localhost:3000";

// === Fungsi Fetch Data ===
async function getData(endpoint) {
  const res = await fetch(`${API_BASE}/${endpoint}`);
  if (!res.ok) throw new Error("Gagal memuat data: " + endpoint);
  return await res.json();
}

// === Fungsi Render Data ke Dashboard ===
async function loadDashboard() {
  try {
    const [barang, masuk, keluar] = await Promise.all([
      getData("databarang"),
      getData("barangmasuk"),
      getData("barangkeluar")
    ]);

    // Ubah angka ringkasan di dashboard
    document.querySelectorAll(".stat-number")[0].textContent = barang.length;
    document.querySelectorAll(".stat-number")[1].textContent = masuk.length;
    document.querySelectorAll(".stat-number")[2].textContent = keluar.length;

    // Render tabel barang masuk
    const tbodyMasuk = document.querySelectorAll(".dashboard-table tbody")[0];
    tbodyMasuk.innerHTML = masuk.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.nama_barang}</td>
        <td><span class="date-highlight">${new Date(item.tanggal).toLocaleDateString("id-ID")}</span></td>
        <td class="jumlah"><span class="quantity-green">${item.jumlah}</span></td>
      </tr>
    `).join("");

    // Render tabel barang keluar
    const tbodyKeluar = document.querySelectorAll(".dashboard-table tbody")[1];
    tbodyKeluar.innerHTML = keluar.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.nama_barang}</td>
        <td><span class="date-highlight">${new Date(item.tanggal).toLocaleDateString("id-ID")}</span></td>
        <td class="jumlah"><span class="quantity-red">${item.jumlah}</span></td>
      </tr>
    `).join("");

  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
document.addEventListener("DOMContentLoaded", async () => {
  const tableMasukBody = document.querySelector(".dashboard-table:nth-of-type(1) tbody");
  const tableKeluarBody = document.querySelector(".dashboard-table:nth-of-type(2) tbody");

  try {
    // Panggil endpoint backend
    const response = await fetch("http://localhost:4000/api/dasboard");
    const data = await response.json();

    if (!Array.isArray(data)) throw new Error("Data tidak valid");

    // Kosongkan tabel sebelum isi
    tableMasukBody.innerHTML = "";
    tableKeluarBody.innerHTML = "";

    // Isi tabel Barang Masuk (contoh: 5 pertama)
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

    // Isi tabel Barang Keluar (contoh: 5 berikutnya)
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

  } catch (error) {
    console.error("Gagal memuat data:", error);
  }
});
