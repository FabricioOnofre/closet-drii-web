import { auth } from "../../../utils/firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

export function inicializarHeader() {
  const container = document.querySelector(".nav-container");
  if (!container) return;

  // 1. Aplica classe .active no link corrente
  const caminhoAtual = window.location.pathname.toLowerCase();
  const linksMenu = container.querySelectorAll(".nav-link");

  linksMenu.forEach((link) => {
    const hrefLink = link.getAttribute("href")?.toLowerCase() || "";
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
    const homeLink = container.querySelector('.nav-link[href*="home.html"]');
    if (homeLink) homeLink.classList.add("active");
  }

  // 2. Configura a UI de Autenticação e Níveis de Acesso (Admin/Cliente)
  const userNameSpan = container.querySelector(".user-name");
  const logoutBtn = container.querySelector("#logoutBtn");
  const guestElems = container.querySelectorAll('[data-auth="guest"]');
  const userElems = container.querySelectorAll('[data-auth="user"]');
  const clientLinks = container.querySelectorAll(
    '.nav-link[data-role="cliente"]',
  );
  const adminLinks = container.querySelectorAll('.nav-link[data-role="admin"]');

  onAuthStateChanged(auth, (user) => {
    const isLoggedIn = !!user;
    guestElems.forEach(
      (el) => (el.style.display = isLoggedIn ? "none" : "flex"),
    );
    userElems.forEach(
      (el) => (el.style.display = isLoggedIn ? "flex" : "none"),
    );

    if (isLoggedIn) {
      const loggedUserRaw = localStorage.getItem("loggedUser");
      if (loggedUserRaw) {
        const dadosUsuario = JSON.parse(loggedUserRaw);
        const isAdmin = dadosUsuario.perfil === "admin";

        clientLinks.forEach(
          (el) => (el.style.display = isAdmin ? "none" : "flex"),
        );
        adminLinks.forEach(
          (el) => (el.style.display = isAdmin ? "flex" : "none"),
        );
      }
      if (userNameSpan && user) {
        userNameSpan.textContent = user.displayName || user.email.split("@")[0];
      }
    } else {
      clientLinks.forEach((el) => (el.style.display = "flex"));
      adminLinks.forEach((el) => (el.style.display = "none"));
      if (userNameSpan) userNameSpan.textContent = "Perfil";
    }
  });

  // 3. Evento de Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        localStorage.removeItem("loggedUser");
        window.location.href = "../../pages/home/home.html";
      } catch (err) {
        console.error("Erro ao sair:", err);
      }
    });
  }

  // 4. Controle do Menu Hamburguer Mobile
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      navMenu.classList.toggle("open");
      const icone = menuToggle.querySelector("i");
      if (icone)
        icone.className = navMenu.classList.contains("open")
          ? "fas fa-times"
          : "fas fa-bars";
    });

    container.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        const icone = menuToggle.querySelector("i");
        if (icone) icone.className = "fas fa-bars";
      });
    });

    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove("open");
        const icone = menuToggle.querySelector("i");
        if (icone) icone.className = "fas fa-bars";
      }
    });
  }
}
