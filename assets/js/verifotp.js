document.getElementById("verifyOtpForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = localStorage.getItem("reset_email");
    const otp = document.getElementById("otp").value;

    if (!email) {
        alert("Email tidak ditemukan! Silakan ulangi lupa password.");
        window.location.href = "lupapw.html";
        return;
    }

    const response = await fetch("http://localhost:3000/api/verifotp", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
    });

    const result = await response.json();

    if (response.ok) {
        alert("OTP benar! Silakan buat password baru.");
        window.location.href = "resetpw.html";
    } else {
        alert(result.error || "Kode OTP salah!");
    }
});
