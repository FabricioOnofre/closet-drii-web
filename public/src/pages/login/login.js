// src/pages/login/login.js
import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById("login-form");

  // Ouve o evento de envio do formulário corretamente
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Impede o reload da página

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Simulação de autenticação
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userExists = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (userExists) {
      // Sucesso: mostra o snackbar e aguarda um pouco para redirecionar
      showSnackbar("Login realizado com sucesso!", "success");

      localStorage.setItem("loggedUser", JSON.stringify(userExists));

      // Pequeno delay para o usuário conseguir ver o toast antes de mudar de página
      setTimeout(() => {
        window.location.href = "../home/home.html";
      }, 1500);
    } else {
      // Erro: mostra o snackbar de erro
      showSnackbar("E-mail ou senha incorretos.", "invalid");
    }
  });
});