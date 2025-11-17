// public/js/lupapw.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotPasswordForm");
  const btnSubmit = document.getElementById("btnSubmit");

  // Ganti otomatis ke origin server (localhost atau domain)
const API_BASE = "http://localhost:3000";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    // Validasi email
    if (!email) {
      alert("⚠️ Masukkan email terlebih dahulu");
      return;
    }

    if (!validateEmail(email)) {
      alert("⚠️ Format email tidak valid");
      return;
    }

    // Disable tombol saat proses (prevent double click)
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Mengirim OTP...";

    try {
      const res = await fetch(`${API_BASE}/api/lupapw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || data.message || "Terjadi kesalahan saat mengirim OTP");
        return;
      }

      alert("📩 OTP berhasil dikirim ke email Anda.");
      localStorage.setItem("resetEmail", email);

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
