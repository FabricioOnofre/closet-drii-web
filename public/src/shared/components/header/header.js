import { auth } from "../../../utils/firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// 1. Função que descobre a página atual e aplica a classe .active
function aplicarLinkAtivo() {
  const caminhoAtual = window.location.pathname.toLowerCase();
  const linksMenu = document.querySelectorAll(".nav-container .nav-link");

  // Se o menu ainda não foi injetado pelo loader, cancela e espera o observador
  if (linksMenu.length === 0) return false;

  linksMenu.forEach((link) => {
    link.classList.remove("active");

    const hrefLink = link.getAttribute("href").toLowerCase();
    const nomeArquivo = hrefLink.substring(hrefLink.lastIndexOf("/") + 1);

    // Se a URL do navegador contiver o nome do arquivo do link (ex: "home.html")
    if (caminhoAtual.includes(nomeArquivo) && nomeArquivo !== "") {
      link.classList.add("active");
    }
  });

  // Tratamento especial para a raiz do Firebase ou index.html
  if (
    caminhoAtual === "/" ||
    caminhoAtual.endsWith("/index.html") ||
    caminhoAtual.includes("/home/")
  ) {
    const homeLink = document.querySelector(
      '.nav-container .nav-link[href*="home.html"]',
    );
    if (homeLink) homeLink.classList.add("active");
  }

  return true; // Sucesso
}

// 2. Inicializa UI do header conforme estado de autenticação
function initAuthUI() {
  const userNameSpan = document.querySelector(".nav-container .user-name");
  const logoutBtn = document.getElementById("logoutBtn");

  const guestElems = document.querySelectorAll('[data-auth="guest"]');
  const userElems = document.querySelectorAll('[data-auth="user"]');

  function setAuthUI(isLoggedIn, user) {
    guestElems.forEach((el) => (el.style.display = isLoggedIn ? "none" : ""));
    userElems.forEach((el) => (el.style.display = isLoggedIn ? "" : "none"));

    if (isLoggedIn && user && userNameSpan) {
      userNameSpan.textContent = user.displayName || user.email || "Perfil";
    }
    if (!isLoggedIn && userNameSpan) {
      userNameSpan.textContent = "Perfil";
    }
  }

  onAuthStateChanged(auth, (user) => {
    setAuthUI(!!user, user || null);
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = "../../pages/home/home.html";
      } catch (err) {
        console.error("Erro ao sair:", err);
      }
    });
  }
}

// 2. Automação inteligente: Vigia a página para interceptar a entrada do Header
function inicializarAutoHeader() {
  // Tenta rodar de primeira caso o Header já esteja lá
  if (aplicarLinkAtivo()) {
    initAuthUI();
    return;
  }

  // Se não encontrou, cria um vigia para monitorar o body do HTML
  const vigia = new MutationObserver((mutations, observer) => {
    const menuExiste = document.querySelector(".nav-container .nav-menu");

    if (menuExiste) {
      aplicarLinkAtivo(); // Aplica a classe active
      initAuthUI(); // Configura UI conforme usuário autenticado
      observer.disconnect(); // Desliga o vigia para economizar memória do navegador
    }
  });

  vigia.observe(document.body, { childList: true, subtree: true });
}

// Inicializa o processo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarAutoHeader);
} else {
  inicializarAutoHeader();
}
