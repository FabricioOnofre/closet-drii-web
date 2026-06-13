import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";
import { database } from "../../utils/firebase-config.js";

// Importações necessárias do Firestore SDK
import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  collection,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const CART_STORAGE_KEY = "closetDrii_cart";
let itensCarrinho = getCartFromStorage();

function getCartFromStorage() {
  const dados = localStorage.getItem(CART_STORAGE_KEY);
  return dados ? JSON.parse(dados) : [];
}

function salvarCarrinhoNoStorage() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(itensCarrinho));
}

export function adicionarAoCarrinho(novoItem) {
  itensCarrinho = getCartFromStorage();
  const itemExistente = itensCarrinho.find(
    (item) => item.id_variante === novoItem.id_variante,
  );

  if (itemExistente) {
    itemExistente.quantidade += novoItem.quantidade || 1;
  } else {
    itensCarrinho.push(novoItem);
  }

  salvarCarrinhoNoStorage();
  showSnackbar(`${novoItem.nome} adicionado ao carrinho!`, "success");
}

function renderizarCarrinho() {
  const listContainer = document.getElementById("cart-items-container");
  const emptyMessage = document.getElementById("empty-cart-message");
  const template = document.getElementById("template-cart-item");

  if (!listContainer || !template) return;

  listContainer.innerHTML = "";

  if (itensCarrinho.length === 0) {
    listContainer.style.display = "none";
    if (emptyMessage) emptyMessage.style.display = "block";
    atualizarResumoFinanceiro();
    return;
  }

  listContainer.style.display = "flex";
  if (emptyMessage) emptyMessage.style.display = "none";

  itensCarrinho.forEach((item) => {
    const clone = template.content.cloneNode(true);
    const subtotalItem = item.preco * item.quantidade;

    clone.querySelector(".cart-nome").textContent = item.nome;
    clone.querySelector(".cart-cor").textContent = item.cor;
    clone.querySelector(".cart-tamanho").textContent = item.tamanho;

    const imgElement = clone.querySelector(".cart-img");
    if (imgElement) {
      imgElement.src = item.imagem_url || "../../assets/img/logo.jpg";
      imgElement.alt = item.nome;
    }

    const qtyInput = clone.querySelector(".cart-qty-input");
    if (qtyInput) qtyInput.value = item.quantidade;

    clone.querySelector(".cart-preco-unitario").textContent =
      `Unid: ${item.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;

    clone.querySelector(".cart-subtotal-item").textContent =
      subtotalItem.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

    clone.querySelector(".btn-qty-minus").addEventListener("click", () => {
      if (item.quantidade > 1) {
        item.quantidade--;
        salvarCarrinhoNoStorage();
        renderizarCarrinho();
      }
    });

    clone.querySelector(".btn-qty-plus").addEventListener("click", () => {
      item.quantidade++;
      salvarCarrinhoNoStorage();
      renderizarCarrinho();
    });

    clone.querySelector(".btn-remove-item").addEventListener("click", () => {
      itensCarrinho = itensCarrinho.filter(
        (i) => i.id_variante !== item.id_variante,
      );
      salvarCarrinhoNoStorage();
      showSnackbar(`${item.nome} removido do carrinho.`, "info");
      renderizarCarrinho();
    });

    listContainer.appendChild(clone);
  });

  atualizarResumoFinanceiro();
}

function calcularTotal() {
  return itensCarrinho.reduce(
    (acumulador, item) => acumulador + item.preco * item.quantidade,
    0,
  );
}

function atualizarResumoFinanceiro() {
  const totalFinal = calcularTotal();
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

// 🌟 NOVA FUNÇÃO: Processa a transação relacional completa no banco de dados
async function processarCheckoutBancoDados() {
  const btnCheckout = document.getElementById("btn-checkout");

  // 1. Recupera o usuário logado da sessão
  const loggedUserRaw = localStorage.getItem("loggedUser");
  if (!loggedUserRaw) {
    showSnackbar(
      "Você precisa estar logado para finalizar uma compra.",
      "invalid",
    );
    setTimeout(() => (window.location.href = "../login/login.html"), 2000);
    return;
  }
  const usuarioLogado = JSON.parse(loggedUserRaw);

  if (btnCheckout) btnCheckout.disabled = true;
  showSnackbar("Processando seu pedido, aguarde...", "info");

  try {
    // Usamos runTransaction para garantir atomicidade (ou grava tudo com sucesso ou reverte tudo em caso de erro de estoque)
    await runTransaction(database, async (transaction) => {
      // --- PASSO 2: Obter IDs incrementais para Vendas e Itens através de contadores locais ---
      const vendasCounterRef = doc(database, "contadores", "vendas");
      const produtoVendasCounterRef = doc(
        database,
        "contadores",
        "produto_vendas",
      );

      const vendasCounterSnap = await transaction.get(vendasCounterRef);
      const prodVendasCounterSnap = await transaction.get(
        produtoVendasCounterRef,
      );

      let proximoVendaId = vendasCounterSnap.exists()
        ? vendasCounterSnap.data().atual + 1
        : 1;
      let proximoProdVendaId = prodVendasCounterSnap.exists()
        ? prodVendasCounterSnap.data().atual
        : 0;

      // --- PASSO 3: Validar Estoque de Cada Item antes de confirmar a compra ---
      const variantesAtualizadas = [];

      for (const item of itensCarrinho) {
        const varianteRef = doc(
          database,
          "produto_variantes",
          String(item.id_variante),
        );
        const varianteSnap = await transaction.get(varianteRef);

        if (!varianteSnap.exists()) {
          throw new Error(
            `A variante do produto ${item.nome} não foi encontrada no banco.`,
          );
        }

        const estoqueAtual = Number(varianteSnap.data().estoque);
        if (estoqueAtual < item.quantidade) {
          throw new Error(
            `Estoque insuficiente para ${item.nome} (${item.cor} - ${item.tamanho}). Disponível: ${estoqueAtual}`,
          );
        }

        // Guarda os dados calculados para atualizar o estoque caso a transação passe no teste
        variantesAtualizadas.push({
          ref: varianteRef,
          novoEstoque: estoqueAtual - item.quantidade,
        });
      }

      // --- PASSO 4: Executar INSERT na tabela de Vendas ---
      const novaVendaRef = doc(database, "vendas", String(proximoVendaId));
      transaction.set(novaVendaRef, {
        usuario_id: String(usuarioLogado.uid),
        valor_total: calcularTotal(),
        status: "pendente", // Simula a aprovação imediata no teste do e-commerce
        endereco_entrega_id: "1", // Associa a uma FK padrão ou id do endereço salvo
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // --- PASSO 5: Executar INSERTs na tabela produto_vendas e dar UPDATE no estoque ---
      for (const item of itensCarrinho) {
        proximoProdVendaId++;
        const itemVendaRef = doc(
          database,
          "produto_vendas",
          String(proximoProdVendaId),
        );

        transaction.set(itemVendaRef, {
          produto_variante_id: String(item.id_variante),
          venda_id: String(proximoVendaId),
          quantidade: item.quantidade,
          valor: item.preco * item.quantidade,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Atualiza os estoques reduzidos
      variantesAtualizadas.forEach((v) => {
        transaction.update(v.ref, {
          estoque: v.novoEstoque,
          updated_at: new Date().toISOString(),
        });
      });

      // Atualiza os contadores globais ordinais
      transaction.set(vendasCounterRef, { atual: proximoVendaId });
      transaction.set(produtoVendasCounterRef, { atual: proximoProdVendaId });
    });

    // --- SUCESSO COMPLETO ---
    showSnackbar(
      "Pedido finalizado com sucesso! Estoque atualizado.",
      "success",
    );

    // Limpa o estado local
    itensCarrinho = [];
    localStorage.removeItem(CART_STORAGE_KEY);
    renderizarCarrinho();
  } catch (error) {
    console.error("❌ Erro na transação de checkout:", error);
    showSnackbar(
      error.message || "Erro desconhecido ao processar pedido.",
      "invalid",
    );
    if (btnCheckout) btnCheckout.disabled = false;
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  itensCarrinho = getCartFromStorage();
  renderizarCarrinho();

  // Atrela o evento de clique do checkout à nossa nova função relacional robusta
  document
    .getElementById("btn-checkout")
    ?.addEventListener("click", processarCheckoutBancoDados);
});