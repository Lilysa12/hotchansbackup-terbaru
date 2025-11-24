document.getElementById("verifyOtpForm").addEventListener("submit", async (e) => {
    // Mencegah reload halaman saat form disubmit
    e.preventDefault();

    // Ambil email yang tersimpan sementara di localStorage saat proses lupa password
    const email = localStorage.getItem("reset_email");
    // Ambil kode OTP yang dimasukkan user
    const otp = document.getElementById("otp").value;

    // Jika email tidak ditemukan di localStorage, tampilkan alert dan redirect ke halaman lupa password
    if (!email) {
        alert("Email tidak ditemukan! Silakan ulangi lupa password.");
        window.location.href = "lupapw.html";
        return;
    }

    // Kirim request POST ke API untuk memverifikasi OTP
    const response = await fetch("http://localhost:3000/api/verifotp", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
    });

    // Ambil hasil respon dari server dalam bentuk JSON
    const result = await response.json();

    // Jika respon berhasil (HTTP status 200), alert OTP valid dan redirect ke halaman reset password
    if (response.ok) {
        alert("OTP benar! Silakan buat password baru.");
        window.location.href = "resetpw.html";
    } else {
        // Jika gagal, tampilkan error dari server atau pesan default
        alert(result.error || "Kode OTP salah!");
    }
});
