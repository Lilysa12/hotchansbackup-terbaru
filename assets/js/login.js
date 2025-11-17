// --- Supabase Config (Frontend Only) ---
const SUPABASE_URL = "https://cwvcprzdovbpteiuuvgj.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmNwcnpkb3ZicHRlaXV1dmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzEwODYsImV4cCI6MjA3ODM0NzA4Nn0.Poi74Rm2rWUWGeoUTmP2CR5zlT_YqnY9j_OdjVz3tFw";
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Element Refs ---
const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

// DEBUG
function debugLog(...msg) {
  console.log("[LOGIN DEBUG]", ...msg);
}

// -------------------------
// LOGIN SUBMIT
// -------------------------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputUser = (loginEmail.value || "").trim();
    const inputPass = (loginPassword.value || "").trim();

    if (!inputUser || !inputPass) {
      alert("⚠ Silakan isi username/email dan password!");
      return;
    }

    debugLog("Sedang mengambil data admin dari Supabase...");

    // --- Ambil admin berdasarkan username / email / id_admin ---
    const { data, error } = await supabase
      .from("admin")
      .select("*")
      .or(
        `username.eq.${inputUser},email.eq.${inputUser},id_admin.eq.${inputUser}`
      )
      .maybeSingle();

    // Jika Supabase error
    if (error) {
      console.error("Supabase Error:", error);
      alert("❌ Tidak dapat terhubung ke database!");
      return;
    }

    // Jika user tidak ditemukan
    if (!data) {
      alert("❌ Username / Email / ID Admin tidak ditemukan!");
      return;
    }

    // Cek password
    if (data.password !== inputPass) {
      alert("❌ Password salah!");
      return;
    }

    // Simpan session
    localStorage.setItem(
      "admin_login",
      JSON.stringify({
        id_admin: data.id_admin,
        username: data.username,
        email: data.email,
      })
    );

    alert("✅ Login berhasil!");
    window.location.href = "dashboard.html";
  });
}

// -------------------------
// AUTO CHECK SESSION
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("admin_login");
  if (user) {
    debugLog("✔ Sudah login");
  } else {
    debugLog("✖ Belum login");
  }
});
