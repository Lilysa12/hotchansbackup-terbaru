// public/js/lupapw.js
document.addEventListener("DOMContentLoaded", () => {
  // Mengambil elemen form Forgot Password
  const form = document.getElementById("forgotPasswordForm");
  // Mengambil tombol submit form
  const btnSubmit = document.getElementById("btnSubmit");

  // API_BASE digunakan sebagai alamat server (localhost atau domain)
const API_BASE = "http://localhost:3000";

// Menangani event submit pada form  
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ambil nilai email dari input dan hapus spasi di awal/akhir
    const email = document.getElementById("email").value.trim();

    // Validasi email kosong
    if (!email) {
      alert("⚠️ Masukkan email terlebih dahulu");
      return;
    }

    // Validasi format email menggunakan regex
    if (!validateEmail(email)) {
      alert("⚠️ Format email tidak valid");
      return;
    }

    // Disable tombol saat proses (prevent double click)
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Mengirim OTP...";

    try {
      // Kirim request POST ke endpoint /api/lupapw dengan body { email }
      const res = await fetch(`${API_BASE}/api/lupapw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Parsing response JSON
      const data = await res.json();

      // Jika response error, tampilkan alert
      if (!res.ok) {
        alert(data.error || data.message || "Terjadi kesalahan saat mengirim OTP");
        return;
      }

      // Jika sukses, tampilkan notifikasi sukses
      alert("📩 OTP berhasil dikirim ke email Anda.");
      // Simpan email ke localStorage untuk digunakan di halaman berikutnya
      localStorage.setItem("resetEmail", email);

      // Redirect ke halaman pengiriman OTP
      window.location.href = "../pages/sendotp.html";
    } catch (err) {
      console.error("Fetch error:", err);
      alert("🚨 Gagal menghubungi server. Pastikan server berjalan.");
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "Kirim OTP";
    }
  });

  // Fungsi validasi email
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
