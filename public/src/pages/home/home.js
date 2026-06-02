import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";
import { openProductModal } from "../../shared/components/product-modal/product-modal.js";

// Banco de dados mockado e expandido com variantes reais
const produtos = [
  {
    id: 1,
    nome: "Vestido Floral",
    descricao:
      "Vestido leve com estampa floral, perfeito para composições de verão.",
    preco: 150.0,
    categoria: "Vestidos",
    variantes: [
      {
        cor: "Azul",
        tamanho: "M",
        estoque: 5,
        imagem_url: "/src/assets/img/logo.jpg",
      },
      {
        cor: "Azul",
        tamanho: "G",
        estoque: 2,
        imagem_url: "/src/assets/img/logo.jpg",
      },
    ],
  },
  {
    id: 2,
    nome: "Calça Alfaiataria",
    descricao: "Calça corte reto em alfaiataria elegante e cintura alta.",
    preco: 180.0,
    categoria: "Calças",
    variantes: [
      {
        cor: "Preto",
        tamanho: "P",
        estoque: 8,
        imagem_url: "/src/assets/img/logo.jpg",
      },
      {
        cor: "Preto",
        tamanho: "M",
        estoque: 10,
        imagem_url: "/src/assets/img/logo.jpg",
      },
    ],
  },
  {
    id: 3,
    nome: "Blusa Básica",
    descricao: "Blusa t-shirt básica confeccionada em algodão macio.",
    preco: 60.0,
    categoria: "Blusas",
    variantes: [
      {
        cor: "Branco",
        tamanho: "M",
        estoque: 15,
        imagem_url: "/src/assets/img/logo.jpg",
      },
    ],
  },
];

function renderizarProdutos(lista, containerId) {
  const container = document.getElementById(containerId);
  const template = document.getElementById("template-card");

  if (!container || !template) return;
  container.innerHTML = ""; // Limpa antes de injetar

  lista.forEach((produto) => {
    const clone = template.content.cloneNode(true);

    // Preenchimento com formatação de moeda correta
    clone.querySelector(".produto-nome").textContent = produto.nome;
    clone.querySelector(".produto-preco").textContent =
      produto.preco.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

    const imagemPadrao =
      produto.variantes && produto.variantes[0]
        ? produto.variantes[0].imagem_url
        : "/src/assets/img/logo.jpg";
    clone.querySelector(".produto-img").src = imagemPadrao;
    clone.querySelector(".produto-img").alt = produto.nome;

    // Gatilho 1: Clicar no corpo do card abre o Modal Detalhado
    clone.querySelector(".open-modal-trigger").addEventListener("click", () => {
      openProductModal(produto);
    });

    // Gatilho 2: Clicar direto no botão adiciona a variante padrão na sacola
    clone.querySelector(".add-btn").addEventListener("click", (e) => {
      e.stopPropagation(); // Evita disparar o clique do modal por acidente
      showSnackbar(
        `Adicionado: ${produto.nome} (${produto.variantes[0].cor}/${produto.variantes[0].tamanho})`,
        `success`,
      );
    });

    container.appendChild(clone);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarProdutos(produtos, "product-best-seller");
  renderizarProdutos(produtos, "product-offer");
});
