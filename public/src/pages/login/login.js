import { auth } from "../../utils/firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;
      showSnackbar("Login realizado com sucesso!", "success");

      localStorage.setItem(
        "loggedUser",
        JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || null,
        }),
      );

      setTimeout(() => {
        window.location.href = "../home/home.html";
      }, 1500);
    } catch (error) {
      showSnackbar(parseFirebaseAuthError(error), "invalid");
    }
  });
});

function parseFirebaseAuthError(error) {
  switch (error.code) {
    case "auth/wrong-password":
      return "Senha incorreta.";
    case "auth/user-not-found":
      return "Usuário não encontrado.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    default:
      return "Falha ao realizar login. Verifique seus dados e tente novamente.";
  }
}
