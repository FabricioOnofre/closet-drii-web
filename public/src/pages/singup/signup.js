import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";

document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastro-form');

    cadastroForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // 1. Validação de senhas
        if (password !== confirmPassword) {
            showSnackbar("As senhas não coincidem!", "error");
            return;
        }

        // 2. Simulação de salvamento no localStorage
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        
        // Verifica se usuário já existe
        if (users.find(u => u.email === email)) {
            showSnackbar("Este e-mail já está cadastrado.", "invalid");
            return;
        }

        // 3. Salva novo usuário
        const newUser = { name, email, phone, password };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        // 4. Feedback e Redirecionamento
        showSnackbar("Cadastro realizado com sucesso!", "success");
        
        setTimeout(() => {
            window.location.href = "../login/login.html";
        }, 2000);
    });
});