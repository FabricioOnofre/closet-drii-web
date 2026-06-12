import { auth } from "../../../utils/firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

function aplicarLinkAtivo() {
  const caminhoAtual = window.location.pathname.toLowerCase();
  const linksMenu = document.querySelectorAll(".nav-container .nav-link");

  if (linksMenu.length === 0) return false;

  linksMenu.forEach((link) => {
    link.classList.remove("active");
    const hrefLink = link.getAttribute("href").toLowerCase();
    const nomeArquivo = hrefLink.substring(hrefLink.lastIndexOf("/") + 1);

    if (caminhoAtual.includes(nomeArquivo) && nomeArquivo !== "") {
      link.classList.add("active");
    }
  });

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

  return true;
}

function initAuthUI() {
  const userNameSpan = document.querySelector(".nav-container .user-name");
  const logoutBtn = document.getElementById("logoutBtn");

  const guestElems = document.querySelectorAll('[data-auth="guest"]');
  const userElems = document.querySelectorAll('[data-auth="user"]');

  // Seletores das permissões de rotas no menu
  const clientLinks = document.querySelectorAll(
    '.nav-container .nav-link[data-role="cliente"]',
  );
  const adminLinks = document.querySelectorAll(
    '.nav-container .nav-link[data-role="admin"]',
  );

  function setAuthUI(isLoggedIn, user) {
    guestElems.forEach(
      (el) => (el.style.display = isLoggedIn ? "none" : "flex"),
    );
    userElems.forEach(
      (el) => (el.style.display = isLoggedIn ? "flex" : "none"),
    );

    // Lógica de diferenciação de links por perfil de banco de dados
    if (isLoggedIn) {
      const loggedUserRaw = localStorage.getItem("loggedUser");
      if (loggedUserRaw) {
        const dadosUsuario = JSON.parse(loggedUserRaw);

        if (dadosUsuario.perfil === "admin") {
          // Se for admin, oculta carrinho/pedidos e exibe painel admin
          clientLinks.forEach((el) => (el.style.display = "none"));
          adminLinks.forEach((el) => (el.style.display = "flex"));
        } else {
          // Se for cliente comum
          clientLinks.forEach((el) => (el.style.display = "flex"));
          adminLinks.forEach((el) => (el.style.display = "none"));
        }
      }

      if (userNameSpan && user) {
        userNameSpan.textContent =
          user.displayName || user.email.split("@")[0] || "Perfil";
      }
    } else {
      // Se estiver deslogado, mostra apenas os links de cliente comuns (vitrine/carrinho local)
      clientLinks.forEach((el) => (el.style.display = "flex"));
      adminLinks.forEach((el) => (el.style.display = "none"));
      if (userNameSpan) userNameSpan.textContent = "Perfil";
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
        localStorage.removeItem("loggedUser"); // Limpa sessão local estruturada
        window.location.href = "../../pages/home/home.html";
      } catch (err) {
        console.error("Erro ao sair:", err);
      }
    });
  }
}

// 🌟 NOVA FUNÇÃO: Controle do menu Hamburguer Mobile
function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    navMenu.classList.toggle("open");

    // Troca o ícone de hambúrguer (bars) para fechar (times)
    const icone = menuToggle.querySelector("i");
    if (navMenu.classList.contains("open")) {
      icone.className = "fas fa-times";
    } else {
      icone.className = "fas fa-bars";
    }
  });

  // Fecha o menu caso o usuário clique em qualquer link
  document.querySelectorAll(".nav-container .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      menuToggle.querySelector("i").className = "fas fa-bars";
    });
  });

  // Fecha o menu se clicar em qualquer lugar fora dele na tela
  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      navMenu.classList.remove("open");
      menuToggle.querySelector("i").className = "fas fa-bars";
    }
  });
}

function inicializarAutoHeader() {
  if (aplicarLinkAtivo()) {
    initAuthUI();
    setupMobileMenu();
    return;
  }

  const vigia = new MutationObserver((mutations, observer) => {
    const menuExiste = document.querySelector(".nav-container .nav-menu");

    if (menuExiste) {
      aplicarLinkAtivo();
      initAuthUI();
      setupMobileMenu(); // Inicia a escuta do click mobile
      observer.disconnect();
    }
  });

  vigia.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarAutoHeader);
} else {
  inicializarAutoHeader();
}
