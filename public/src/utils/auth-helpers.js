import { auth } from "./firebase-config.js";
import { showSnackbar } from "../shared/components/snackbar/snackbar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

export function protegerRota(callbackSucesso, mensagemErro = "Acesso restrito. Faça login para continuar.") {
  //showSnackbar("Verificando credenciais...", "info");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      showSnackbar(mensagemErro, "invalid");
      
      // Limpeza preventiva de estado local corrompido ou forjado
      localStorage.removeItem("loggedUser");

      setTimeout(() => {
        // Redireciona de forma relativa considerando a estrutura padrão das suas páginas (/pages/nome-da-pagina/)
        window.location.href = "../login/login.html";
      }, 2000);
      return;
    }

    // Usuário autenticado com sucesso: repassa o objeto 'user' seguro para a tela solicitante
    if (typeof callbackSucesso === "function") {
      await callbackSucesso(user);
    }
  });
}