// assets/js/passwordbaru.js

document.addEventListener('DOMContentLoaded', () => {
    // Ambil form untuk input password baru
    const newPasswordForm = document.getElementById('new-password-form');
    // Ambil input field password baru
    const passwordInput = document.getElementById('password');
    // Ambil input field konfirmasi password
    const confirmPasswordInput = document.getElementById('confirm-password');
    // Ambil element untuk menampilkan pesan error
    const passwordError = document.getElementById('password-error');

    // Fungsi validasi kesamaan password dan konfirmasi password
    function validatePasswordMatch() {
        // Jika password dan konfirmasi tidak sama
        if (passwordInput.value !== confirmPasswordInput.value) {
            passwordError.textContent = "Konfirmasi password tidak cocok.";
            confirmPasswordInput.setCustomValidity("Mismatch");
            return false;
        // Jika cocok
        } else {
            passwordError.textContent = "";
            confirmPasswordInput.setCustomValidity("");
            return true;
        }
    }

    // Tambahkan event listener untuk mengecek perubahan input password
    if (passwordInput) passwordInput.addEventListener('input', validatePasswordMatch);
    if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    // Event listener untuk submit form password baru
    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            
            // Pastikan validasi dijalankan saat submit
            if (!validatePasswordMatch()) {
                alert("Mohon perbaiki kesalahan input password.");
                return;
            }

            // SIMULASI BERHASIL:
            alert("Password baru berhasil disimpan!");
            
            // REDIRECT KE HALAMAN SUKSES (sesuai struktur /pages/sukses.html)
            window.location.href = 'sukses.html'; 
        });
    }
});
