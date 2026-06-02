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

// 2. Automação inteligente: Vigia a página para interceptar a entrada do Header
function inicializarAutoHeader() {
  // Tenta rodar de primeira caso o Header já esteja lá
  if (aplicarLinkAtivo()) return;

  // Se não encontrou, cria um vigia para monitorar o body do HTML
  const vigia = new MutationObserver((mutations, observer) => {
    const menuExiste = document.querySelector(".nav-container .nav-menu");

    if (menuExiste) {
      aplicarLinkAtivo(); // Aplica a classe active
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
