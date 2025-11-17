const SUPABASE_URL = "https://cwvcprzdovbpteiuuvgj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("new-password-form");

  if (!form) {
    console.error("FORM TIDAK DITEMUKAN! Pastikan id='new-password-form'");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value.trim();
    const confirm = document.getElementById("confirm-password").value.trim();
    const email = localStorage.getItem("resetEmail");

    if (!password || !confirm) {
      alert("⚠ Isi semua field password!");
      return;
    }

    if (password !== confirm) {
      alert("⚠ Password tidak sama!");
      return;
    }

    if (!email) {
      alert("⚠ Email tidak ditemukan. Ulangi proses reset password.");
      return;
    }

    const { error } = await supabase
      .from("admin")
      .update({ password })
      .eq("email", email);

    if (error) {
      console.error(error);
      alert("❌ Gagal update password!");
      return;
    }

    alert("✅ Password berhasil diubah!");
    localStorage.removeItem("resetEmail");
    window.location.href = "../pages/login.html";
  });
});
