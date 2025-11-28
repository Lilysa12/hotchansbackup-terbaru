// Ambil elemen modal
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const logoutModal = document.getElementById('logout-modal');
const deleteAccountModal = document.getElementById('delete-account-modal');

// ===== BAGIAN DEBUGGING NOTIFIKASI =====
console.log("File profile.js berhasil dimuat."); // Cek 1

const notificationModal = document.getElementById('notification-modal');
const notifBtn = document.getElementById('notif-btn');

console.log("Mencari tombol notifikasi:", notifBtn); // Cek 2
console.log("Mencari modal notifikasi:", notificationModal); // Cek 3
// =========================================

// Buka modal saat tombol "Edit Profil" diklik
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        editProfileModal.style.display = 'block';
    });
}

// Tutup modal saat klik tombol close atau batal
document.querySelectorAll('.close-btn, .btn-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    });
});

// Simpan perubahan dari modal gabungan
const editForm = document.getElementById('edit-profile-form');
if (editForm) {
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // ... (kode simpan form Anda, tidak diubah) ...
        const storeName = document.getElementById('store-name').value;
        const role1 = document.getElementById('role1').value;
        const role2 = document.getElementById('role2').value;
    
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const bioPersonal = document.getElementById('bio-personal').value;
    
        const province = document.getElementById('province').value;
        const city = document.getElementById('city').value;
        const district = document.getElementById('district').value;
        const zip = document.getElementById('zip').value;
    
        // Update elemen teks di tampilan admin info
        document.querySelector('.admin-info strong').textContent = storeName;
        const smalls = document.querySelectorAll('.admin-info small');
        smalls[0].textContent = role1;
        smalls[1].textContent = role2;
    
        // Update tampilan data personal di card kedua
        const personal = document.querySelectorAll('.card:nth-of-type(2) .form-group p');
        personal[0].textContent = firstName;
        personal[1].textContent = lastName;
        personal[2].textContent = email;
        personal[3].textContent = phone;
        personal[4].textContent = bioPersonal;
    
        // Update tampilan alamat di card ketiga
        const address = document.querySelectorAll('.card:nth-of-type(3) .form-group p');
        address[0].textContent = province;
        address[1].textContent = city;
        address[2].textContent = district;
        address[3].textContent = zip;
        address[4].textContent = bioPersonal;
    
        // Tutup modal setelah submit
        editProfileModal.style.display = 'none';
    });
}

// ✅ BAGIAN LOGOUT — HANYA INI YANG DIREVISI
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logoutModal.style.display = 'block';
    });
}

// Tombol batal logout
document.getElementById('logout-no')?.addEventListener('click', () => {
    logoutModal.style.display = 'none';
});

// Tombol konfirmasi logout
document.getElementById('logout-yes')?.addEventListener('click', () => {
    // 🧹 Hapus data login dari localStorage
    localStorage.removeItem("admin_login");

    // 🔁 Redirect ke halaman login
    window.location.href = '../pages/login.html';
});

// Notifikasi
if (notifBtn) {
    notifBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("Tombol Notifikasi DIKLIK!"); // Cek 4
        if (notificationModal) {
            notificationModal.style.display = 'block';
            console.log("Modal notifikasi seharusnya TAMPIL."); // Cek 5
        } else {
            console.error("Modal notifikasi (notification-modal) tidak ditemukan saat diklik!");
        }
    });
} else {
    console.error("Tombol notifikasi (notif-btn) tidak ditemukan, event listener tidak bisa dipasang.");
}

// Klik di luar modal untuk menutup
window.onclick = (event) => {
    document.querySelectorAll('.modal').forEach(m => {
        if (event.target === m) m.style.display = 'none';
    });
};
