// assets/js/otp.js
document.addEventListener('DOMContentLoaded', () => {

  // Base URL API untuk server (localhost atau domain production)
  const API_BASE = "http://localhost:3000"; // <= FIX TERPENTING

  // Ambil semua input OTP (6 digit)
  const otpInputs = document.querySelectorAll(".otp-input");
  // Tombol konfirmasi OTP
  const confirmOtpButton = document.getElementById("confirm-otp");
  // Element untuk menampilkan timer
  const timerDisplay = document.getElementById("timer");
  // Link untuk mengirim ulang OTP
  const resendLink = document.getElementById("resend-link");

  // Variabel interval timer OTP
  let otpTimerInterval;
  // Waktu awal timer dalam detik (5 menit)
  const initialTimeInSeconds = 5 * 60;
  // Waktu tampilan awal (4 menit 49 detik)
  const displayStartTimeInSeconds = (4 * 60) + 49;

  // Looping setiap input OTP untuk menambahkan event listener
  otpInputs.forEach((input, index) => {
    // Event ketika input berubah
    input.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      if (/\D/.test(value)) {
        e.target.value = '';
        return;
      }
      if (value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
      checkOtpInputs();
    });

    // Event untuk menangani backspace
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  // Fungsi untuk mengecek apakah semua input OTP sudah terisi
  function checkOtpInputs() {
    let filled = [...otpInputs].every(x => x.value.length === 1);
    confirmOtpButton.disabled = !filled;
  }

  // Format detik menjadi MM:SS
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // Fungsi untuk memulai timer OTP
  function startTimer(sec) {
    clearInterval(otpTimerInterval);
    resendLink.classList.add('resend-link-disabled');
    timerDisplay.textContent = formatTime(sec);

    // Jika waktu awal timer sama dengan 5 menit, tampilkan 4:49
    if (sec === initialTimeInSeconds) {
      sec = displayStartTimeInSeconds;
      timerDisplay.textContent = formatTime(sec);
    }

    // Interval setiap detik untuk mengurangi timer
    otpTimerInterval = setInterval(() => {
      sec--;
      timerDisplay.textContent = formatTime(sec);
      if (sec <= 0) {
        clearInterval(otpTimerInterval);
        timerDisplay.textContent = '00:00';
        resendLink.classList.remove('resend-link-disabled');
      }
    }, 1000);
  }

  // Event klik link kirim ulang OTP
  resendLink.addEventListener('click', async (e) => {
    if (!resendLink.classList.contains('resend-link-disabled')) {
      e.preventDefault();
      const email = localStorage.getItem("resetEmail");
      if (!email) return alert("Email tidak ditemukan.");

      try {
        // Kirim request POST untuk mengirim ulang OTP
        const res = await fetch(`${API_BASE}/api/sendotp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (!res.ok) return alert(data.error || data.message);

        // Event klik tombol konfirmasi OTP
        alert("Kode OTP dikirim ulang.");
        // Reset input OTP
        otpInputs.forEach(i => i.value = "");
        // Disable tombol konfirmasi
        confirmOtpButton.disabled = true;
        // Mulai timer baru
        startTimer(initialTimeInSeconds);
        // Fokus ke input pertama
        otpInputs[0].focus();
      } catch (err) {
        console.error(err);
        alert("Gagal menghubungi server.");
      }
    }
  });

  // Event klik tombol konfirmasi OTP
  confirmOtpButton.addEventListener("click", async () => {
    const otpCode = [...otpInputs].map(i => i.value).join('');
    const email = localStorage.getItem("resetEmail");

    if (!email) return alert("Email tidak ditemukan.");

    try {
      // Kirim request POST untuk verifikasi OTP
      const res = await fetch(`${API_BASE}/api/verifotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || data.message);

      // Notifikasi sukses
      alert("OTP valid. Silakan ubah password.");
      // Redirect ke halaman ubah password
      window.location.href = "../pages/passwordbaru.html";
    } catch (err) {
      console.error(err);
      alert("Gagal memverifikasi OTP.");
    }
  });

  // Mulai timer saat halaman dimuat
  startTimer(initialTimeInSeconds);
});
