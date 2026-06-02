

import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";

document.addEventListener('DOMContentLoaded', () => {
    const profileImg = document.getElementById('profile-img');
    const fileInput = document.getElementById('file-input');
    const form = document.getElementById('profile-form');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const inputs = form.querySelectorAll('input');

    // 1. Carregar dados
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    if (user) {
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone;
        document.getElementById('user-name-display').textContent = user.name;
        document.getElementById('user-email-display').textContent = user.email;
        if(user.photo) profileImg.src = user.photo;
    }

    // 2. Toggle Edição
    editBtn.addEventListener('click', () => {
        inputs.forEach(input => input.disabled = false);
        editBtn.style.display = 'none';
        saveBtn.style.display = 'block';
    });

    // 3. Salvar
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updatedUser = {
            ...user,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };

        localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
        
        inputs.forEach(input => input.disabled = true);
        editBtn.style.display = 'block';
        saveBtn.style.display = 'none';
        
        document.getElementById('user-name-display').textContent = updatedUser.name;
        document.getElementById('user-email-display').textContent = updatedUser.email;
        showSnackbar("Dados atualizados!", "success");
    });

    // 4. Foto de Perfil
    profileImg.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            profileImg.src = event.target.result;
            user.photo = event.target.result;
            localStorage.setItem("loggedUser", JSON.stringify(user));
        };
        reader.readAsDataURL(file);
    });
});