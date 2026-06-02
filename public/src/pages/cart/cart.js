import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";

// 1. Mock de dados simulando itens persistidos que o cliente adicionou via Modal
let itensCarrinho = [
  {
    id_variante: 101, // ID da linha na tabela `produto_variantes`
    produto_id: 1,
    nome: "Vestido Floral Verão",
    preco: 150.0,
    cor: "Rosa",
    tamanho: "M",
    quantidade: 1,
    imagem_url: "../../assets/img/logo.jpg",
  },
  {
    id_variante: 104,
    produto_id: 2,
    nome: "Calça Alfaiataria Rose",
    preco: 180.0,
    cor: "Rose",
    tamanho: "G",
    quantidade: 2,
    imagem_url: "../../assets/img/logo.jpg",
  },
];

function renderizarCarrinho() {
  const listContainer = document.getElementById("cart-items-container");
  const emptyMessage = document.getElementById("empty-cart-message");
  const template = document.getElementById("template-cart-item");

  if (!listContainer || !template) return;

  // Limpa a lista corrente antes de renderizar
  listContainer.innerHTML = "";

  // Verifica se o closet está vazio
  if (itensCarrinho.length === 0) {
    listContainer.style.display = "none";
    if (emptyMessage) emptyMessage.style.display = "block";
    atualizarResumoFinanceiro();
    return;
  }

  listContainer.style.display = "flex";
  if (emptyMessage) emptyMessage.style.display = "none";

  // Varre os itens populando o template clonado
  itensCarrinho.forEach((item) => {
    const clone = template.content.cloneNode(true);

    const subtotalItem = item.preco * item.quantidade;

    clone.querySelector(".cart-nome").textContent = item.nome;
    clone.querySelector(".cart-cor").textContent = item.cor;
    clone.querySelector(".cart-tamanho").textContent = item.tamanho;
    clone.querySelector(".cart-img").src = item.imagem_url;
    clone.querySelector(".cart-img").alt = item.nome;
    clone.querySelector(".cart-qty-input").value = item.quantidade;

    clone.querySelector(".cart-preco-unitario").textContent =
      `Unid: ${item.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;

    clone.querySelector(".cart-subtotal-item").textContent =
      subtotalItem.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

    // --- EVENTO: Reduzir Quantidade ---
    clone.querySelector(".btn-qty-minus").addEventListener("click", () => {
      if (item.quantidade > 1) {
        item.quantidade--;
        renderizarCarrinho(); // Remonta a tela com novos valores calculados
      }
    });

    // --- EVENTO: Aumentar Quantidade ---
    clone.querySelector(".btn-qty-plus").addEventListener("click", () => {
      // Em uma app real aqui se checaria o limite da coluna `estoque` da variante
      item.quantidade++;
      renderizarCarrinho();
    });

    // --- EVENTO: Remover Item ---
    clone.querySelector(".btn-remove-item").addEventListener("click", () => {
      itensCarrinho = itensCarrinho.filter(
        (i) => i.id_variante !== item.id_variante,
      );
      showSnackbar(`${item.nome} removido do carrinho.`, "info");
      renderizarCarrinho();
    });

    listContainer.appendChild(clone);
  });

  atualizarResumoFinanceiro();
}

function atualizarResumoFinanceiro() {
  // Redutor acumulando todos os subtotais de produtos
  const totalFinal = itensCarrinho.reduce(
    (acumulador, item) => acumulador + item.preco * item.quantidade,
    0,
  );

  const txtSubtotal = document.getElementById("summary-subtotal");
  const txtTotal = document.getElementById("summary-total");
  const btnCheckout = document.getElementById("btn-checkout");

  if (txtSubtotal)
    txtSubtotal.textContent = totalFinal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  if (txtTotal)
    txtTotal.textContent = totalFinal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  if (btnCheckout) {
    btnCheckout.disabled = itensCarrinho.length === 0;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarCarrinho();

  // Evento do botão de Finalizar Compra
  document.getElementById("btn-checkout")?.addEventListener("click", () => {
    showSnackbar(
      "Processando pedido... Integração com checkout bem-sucedida!",
      "success",
    );

    // Simulação de limpeza pós-venda
    setTimeout(() => {
      itensCarrinho = [];
      renderizarCarrinho();
    }, 1500);
  });
});
