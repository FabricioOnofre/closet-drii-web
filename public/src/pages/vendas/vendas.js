import { database } from "../../utils/firebase-config.js";
import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Estados Globais da Memória do Painel
let vendasGerais = [];
let usuariosMap = {};
let itensPorVendaMap = {};
let filtroStatusAtual = "todos";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Guarda de Segurança de Perfil
  const loggedUserRaw = localStorage.getItem("loggedUser");
  if (!loggedUserRaw) {
    window.location.href = "../login/login.html";
    return;
  }

  const usuarioLogado = JSON.parse(loggedUserRaw);
  if (usuarioLogado.perfil !== "cliente") {
    showSnackbar("Área restrita a administradores.", "error");
    setTimeout(() => (window.location.href = "../home/home.html"), 2000);
    return;
  }

  // 2. Carrega a carga inicial completa do banco relacional plano
  await inicializarDadosPainel();
  setupFiltrosEventos();
});

async function inicializarDadosPainel() {
  try {
    showSnackbar("Carregando base de vendas...", "info");

    const [
      vendasSnapshot,
      produtoVendasSnapshot,
      variantesSnapshot,
      usuariosSnapshot,
    ] = await Promise.all([
      getDocs(collection(database, "vendas")),
      getDocs(collection(database, "produto_vendas")),
      getDocs(collection(database, "produto_variantes")),
      getDocs(collection(database, "usuarios")),
    ]);

    // Salva usuários em dicionário para consulta O(1)
    usuariosSnapshot.forEach((d) => (usuariosMap[d.id] = d.data()));

    // Salva variantes em dicionário para consulta O(1)
    const variantesMap = {};
    variantesSnapshot.forEach((d) => (variantesMap[d.id] = d.data()));

    // Agrupa itens comprados por ID da venda
    itensPorVendaMap = {};
    produtoVendasSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const vendaId = data.venda_id;

      if (!itensPorVendaMap[vendaId]) itensPorVendaMap[vendaId] = [];

      const dadosVariante = variantesMap[data.produto_variante_id] || {};

      itensPorVendaMap[vendaId].push({
        quantidade: data.quantidade,
        valorTotalItem: data.valor,
        cor: dadosVariante.cor || "Padrão",
        tamanho: dadosVariante.tamanho || "U",
        imagem_url: dadosVariante.imagem_url || "../../assets/img/logo.jpg",
        nome: dadosVariante.cor
          ? `Peça Loja ${dadosVariante.cor}`
          : "Look Closet Drii",
      });
    });

    // Mapeia todas as vendas
    vendasGerais = [];
    vendasSnapshot.forEach((docSnap) => {
      vendasGerais.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Ordenação decrescente por ID da venda
    vendasGerais.sort((a, b) => Number(b.id) - Number(a.id));

    // Renderiza a primeira carga completa
    aplicarFiltroEHRender();
  } catch (error) {
    console.error("❌ Erro ao inicializar painel admin:", error);
    showSnackbar("Falha de comunicação com o Firestore.", "error");
  }
}

// 3. Aplica a filtragem em memória baseado no chip ativo
function aplicarFiltroEHRender() {
  const container = document.getElementById("admin-orders-container");
  const emptyMessage = document.getElementById("no-orders-message");
  const countTxt = document.getElementById("orders-count");

  let vendasFiltradas = [...vendasGerais];

  if (filtroStatusAtual !== "todos") {
    vendasFiltradas = vendasGerais.filter(
      (venda) => venda.status.toLowerCase() === filtroStatusAtual,
    );
  }

  if (countTxt) countTxt.textContent = String(vendasFiltradas.length);

  if (vendasFiltradas.length === 0) {
    if (container) container.innerHTML = "";
    if (emptyMessage) emptyMessage.style.display = "block";
    return;
  }

  if (emptyMessage) emptyMessage.style.display = "none";
  renderizarVendasPainel(vendasFiltradas, container);
}

function renderizarVendasPainel(lista, container) {
  const cardTemplate = document.getElementById("template-admin-order-card");
  const itemTemplate = document.getElementById("template-admin-order-item");

  container.innerHTML = "";

  lista.forEach((venda) => {
    const cardClone = cardTemplate.content.cloneNode(true);
    const vendaId = venda.id;
    const cliente = usuariosMap[venda.usuario_id] || {
      nome: "Cliente Desconhecido",
    };

    // Popula metadados
    cardClone.querySelector(".order-id").textContent =
      `#${vendaId.padStart(4, "0")}`;
    cardClone.querySelector(".order-client-name").textContent = cliente.nome;
    cardClone.querySelector(".order-total-price").textContent = Number(
      venda.valor_total,
    ).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    // Trata a badge de status nativa
    const statusBadge = cardClone.querySelector(".order-status-badge");
    statusBadge.textContent = venda.status;
    statusBadge.className = `order-status-badge status-${venda.status.toLowerCase()}`;

    // Seta o valor corrente selecionado no Dropdown de modificação
    const selectStatus = cardClone.querySelector(".status-change-select");
    selectStatus.value = venda.status.toLowerCase();

    // Injeta os itens comprados
    const itemsListContainer = cardClone.querySelector(
      ".order-products-rows-list",
    );
    const produtosDessaVenda = itensPorVendaMap[vendaId] || [];

    produtosDessaVenda.forEach((item) => {
      const itemClone = itemTemplate.content.cloneNode(true);
      itemClone.querySelector(".cart-nome").textContent = item.nome;
      itemClone.querySelector(".cart-cor").textContent = item.cor;
      itemClone.querySelector(".cart-tamanho").textContent = item.tamanho;
      itemClone.querySelector(".qty-count").textContent = item.quantidade;
      itemClone.querySelector(".cart-img").src = item.imagem_url;
      itemClone.querySelector(".cart-subtotal-item").textContent = Number(
        item.valorTotalItem,
      ).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      itemsListContainer.appendChild(itemClone);
    });

    // --- EVENTO: Modificar Status pelo Dropdown ---
    selectStatus.addEventListener("change", async (e) => {
      const novoStatus = e.target.value;
      await modificarStatusNoBanco(vendaId, novoStatus);
    });

    container.appendChild(cardClone);
  });
}

// 4. Salva a modificação do Admin direto no Firestore documento correspondente
async function modificarStatusNoBanco(vendaId, novoStatus) {
  try {
    const vendaRef = doc(database, "vendas", vendaId);
    await updateDoc(vendaRef, {
      status: novoStatus,
      updated_at: new Date().toISOString(),
    });

    showSnackbar(
      `Status do pedido #${vendaId} alterado para ${novoStatus.toUpperCase()}!`,
      "success",
    );

    // Sincroniza o estado local para evitar re-leitura do banco inteiro
    const vendaLocal = vendasGerais.find((v) => v.id === vendaId);
    if (vendaLocal) vendaLocal.status = novoStatus;

    aplicarFiltroEHRender();
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    showSnackbar("Não foi possível salvar a alteração de status.", "error");
  }
}

// 5. Configura o clique nas Abas Superiores
function setupFiltrosEventos() {
  const tabs = document.querySelectorAll(".status-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      filtroStatusAtual = tab.getAttribute("data-status");
      aplicarFiltroEHRender();
    });
  });
}
