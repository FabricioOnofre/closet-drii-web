import { auth } from "../../utils/firebase-config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";

document.addEventListener("DOMContentLoaded", () => {
  const cadastroForm = document.getElementById("cadastro-form");

  cadastroForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showSnackbar("As senhas não coincidem!", "error");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (name) {
        await updateProfile(userCredential.user, {
          displayName: name,
        });
      }

      // Salva telefone e perfil básico no localStorage para compatibilidade
      try {
        const user = userCredential.user;
        const profile = { uid: user.uid, name, email, phone };

        const profiles = JSON.parse(
          localStorage.getItem("userProfiles") || "{}",
        );
        profiles[profile.uid] = profile;
        localStorage.setItem("userProfiles", JSON.stringify(profiles));
      } catch (e) {
        // falha em gravar no localStorage não impede o fluxo
        console.warn("Não foi possível salvar o perfil localmente:", e);
      }

      showSnackbar("Cadastro realizado com sucesso!", "success");

      setTimeout(() => {
        window.location.href = "../login/login.html";
      }, 2000);
    } catch (error) {
      showSnackbar(parseFirebaseAuthError(error), "invalid");
    }
  });
});

function parseFirebaseAuthError(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Este e-mail já está cadastrado.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/weak-password":
      return "Senha muito fraca. Use pelo menos 6 caracteres.";
    case "auth/operation-not-allowed":
      return "Cadastro de e-mail/senha não está habilitado no Firebase.";
    default:
      return "Falha ao criar a conta. Verifique os dados e tente novamente.";
  }
}
