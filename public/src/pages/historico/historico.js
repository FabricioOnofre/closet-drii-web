import { database } from "../../utils/firebase-config.js";
import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";

import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const loggedUserRaw = localStorage.getItem("loggedUser");
  if (!loggedUserRaw) {
    showSnackbar("Faça login para visualizar seu histórico.", "invalid");
    setTimeout(() => {
      window.location.href = "../login/login.html";
    }, 2000);
    return;
  }

  const usuarioLogado = JSON.parse(loggedUserRaw);
  await carregarHistoricoPedidos(usuarioLogado.uid);
});

async function carregarHistoricoPedidos(userUid) {
  const container = document.getElementById("orders-container");
  const emptyMessage = document.getElementById("empty-history-message");

  try {
    const formulasQuery = query(
      collection(database, "vendas"),
      where("usuario_id", "==", String(userUid)),
    );

    const [vendasSnapshot, produtoVendasSnapshot, variantesSnapshot] =
      await Promise.all([
        getDocs(formulasQuery),
        getDocs(collection(database, "produto_vendas")),
        getDocs(collection(database, "produto_variantes")),
      ]);

    if (vendasSnapshot.empty) {
      if (container) container.style.display = "none";
      if (emptyMessage) emptyMessage.style.display = "block";
      return;
    }

    if (container) container.style.display = "flex";
    if (emptyMessage) emptyMessage.style.display = "none";

    const variantesMap = {};
    variantesSnapshot.forEach((docSnap) => {
      variantesMap[docSnap.id] = docSnap.data();
    });

    const itensPorVendaMap = {};
    produtoVendasSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const vendaId = data.venda_id;

      if (!itensPorVendaMap[vendaId]) {
        itensPorVendaMap[vendaId] = [];
      }

      const dadosVariante = variantesMap[data.produto_variante_id] || {};

      itensPorVendaMap[vendaId].push({
        quantidade: data.quantidade,
        valorTotalItem: data.valor,
        cor: dadosVariante.cor || "Padrão",
        tamanho: dadosVariante.tamanho || "U",
        imagem_url: dadosVariante.imagem_url || "../../assets/img/logo.jpg",
        nome: dadosVariante.cor
          ? `Peça Elegance ${dadosVariante.cor}`
          : "Look Closet Drii",
      });
    });

    const listaVendas = [];
    vendasSnapshot.forEach((docSnap) => {
      listaVendas.push({ id: docSnap.id, ...docSnap.data() });
    });

    listaVendas.sort((a, b) => Number(b.id) - Number(a.id));

    const cardTemplate = document.getElementById("template-order-card");
    const itemTemplate = document.getElementById("template-order-item");

    container.innerHTML = "";

    listaVendas.forEach((venda) => {
      const cardClone = cardTemplate.content.cloneNode(true);

      cardClone.querySelector(".order-id").textContent =
        `#${venda.id.padStart(4, "0")}`;

      const dataFormatada = venda.created_at
        ? new Date(venda.created_at).toLocaleDateString("pt-BR")
        : new Date().toLocaleDateString("pt-BR");
      cardClone.querySelector(".order-date").textContent = dataFormatada;

      const statusBadge = cardClone.querySelector(".order-status-badge");
      statusBadge.textContent = venda.status;
      statusBadge.className = `order-status-badge status-${venda.status.toLowerCase()}`;

      cardClone.querySelector(".order-total-price").textContent = Number(
        venda.valor_total,
      ).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      const itemsContainer = cardClone.querySelector(
        ".order-products-rows-list",
      );
      const itensDessaVenda = itensPorVendaMap[venda.id] || [];

      itensDessaVenda.forEach((item) => {
        const itemClone = itemTemplate.content.cloneNode(true);

        itemClone.querySelector(".cart-nome").textContent = item.nome;
        itemClone.querySelector(".cart-cor").textContent = item.cor;
        itemClone.querySelector(".cart-tamanho").textContent = item.tamanho;
        itemClone.querySelector(".qty-count").textContent = item.quantidade;
        itemClone.querySelector(".cart-img").src = item.imagem_url;

        itemClone.querySelector(".cart-preco-unitario").textContent =
          `Unid: ${(item.valorTotalItem / item.quantidade).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;

        itemClone.querySelector(".cart-subtotal-item").textContent = Number(
          item.valorTotalItem,
        ).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

        itemsContainer.appendChild(itemClone);
      });

      container.appendChild(cardClone);
    });
  } catch (error) {
    console.error("❌ Erro ao renderizar histórico:", error);
  }
}
