document.addEventListener("DOMContentLoaded", function() {

    // Ambil modal edit toko dari DOM
    const editModal = document.getElementById("edit-toko-modal");
    // Ambil tombol untuk membuka modal edit toko
    const openBtn = document.getElementById("edit-toko-btn");
    
    // Pastikan modal dan tombol ada sebelum menambahkan event listener
    if (editModal && openBtn) {
        
        // Ambil tombol close (X) di modal
        const closeBtn = editModal.querySelector(".close-btn");
        // Ambil tombol cancel di modal
        const cancelBtn = editModal.querySelector(".btn-cancel");
        // Ambil form edit toko di modal
        const editForm = document.getElementById("edit-toko-form");

        // Fungsi untuk membuka modal
        function openModal() {
            editModal.style.display = "flex";
        }

        // Fungsi untuk menutup modal
        function closeModal() {
            editModal.style.display = "none";
        }

        // Event listener tombol buka modal
        openBtn.onclick = function() {
            openModal();
        }

        // Event listener tombol close (X) untuk menutup modal
        if (closeBtn) {
            closeBtn.onclick = function() {
                closeModal();
            }
        }
        
        // Event listener tombol cancel untuk menutup modal
        if (cancelBtn) {
            cancelBtn.onclick = function() {
                closeModal();
            }
        }
        
        // Tutup modal jika klik di luar area modal
        window.onclick = function(event) {
            if (event.target == editModal) {
                closeModal();
            }
        }
        
        // Event listener submit form edit toko
        if (editForm) {
            editForm.onsubmit = function(e) {
                e.preventDefault(); 
                alert("Perubahan disimpan!"); 
                closeModal(); 
            }
        }
    }
});
