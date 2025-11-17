// assets/js/otp.js
document.addEventListener('DOMContentLoaded', () => {

  const API_BASE = "http://localhost:3000"; // <= FIX TERPENTING

  const otpInputs = document.querySelectorAll(".otp-input");
  const confirmOtpButton = document.getElementById("confirm-otp");
  const timerDisplay = document.getElementById("timer");
  const resendLink = document.getElementById("resend-link");

  let otpTimerInterval;
  const initialTimeInSeconds = 5 * 60;
  const displayStartTimeInSeconds = (4 * 60) + 49;

  otpInputs.forEach((input, index) => {
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

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  function checkOtpInputs() {
    let filled = [...otpInputs].every(x => x.value.length === 1);
    confirmOtpButton.disabled = !filled;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function startTimer(sec) {
    clearInterval(otpTimerInterval);
    resendLink.classList.add('resend-link-disabled');
    timerDisplay.textContent = formatTime(sec);

    if (sec === initialTimeInSeconds) {
      sec = displayStartTimeInSeconds;
      timerDisplay.textContent = formatTime(sec);
    }

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

  resendLink.addEventListener('click', async (e) => {
    if (!resendLink.classList.contains('resend-link-disabled')) {
      e.preventDefault();
      const email = localStorage.getItem("resetEmail");
      if (!email) return alert("Email tidak ditemukan.");

      try {
        const res = await fetch(`${API_BASE}/api/sendotp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (!res.ok) return alert(data.error || data.message);

        alert("Kode OTP dikirim ulang.");
        otpInputs.forEach(i => i.value = "");
        confirmOtpButton.disabled = true;
        startTimer(initialTimeInSeconds);
        otpInputs[0].focus();
      } catch (err) {
        console.error(err);
        alert("Gagal menghubungi server.");
      }
    }
  });

  confirmOtpButton.addEventListener("click", async () => {
    const otpCode = [...otpInputs].map(i => i.value).join('');
    const email = localStorage.getItem("resetEmail");

    if (!email) return alert("Email tidak ditemukan.");

    try {
      const res = await fetch(`${API_BASE}/api/verifotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || data.message);

      alert("OTP valid. Silakan ubah password.");
      window.location.href = "../pages/passwordbaru.html";
    } catch (err) {
      console.error(err);
      alert("Gagal memverifikasi OTP.");
    }
  });

  startTimer(initialTimeInSeconds);
});
