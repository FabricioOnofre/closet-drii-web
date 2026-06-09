import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";
import { openProductModal } from "../../shared/components/product-modal/product-modal.js";

// Banco de dados fictício
const produtos = [
  {
    id: 1,
    nome: "Vestido Floral Verão",
    descricao:
      "Vestido leve, perfeito para dias quentes. Confeccionado em tecido respirável com caimento fluido.",
    preco: 150.0,
    categoria: "Vestidos",
    variantes: [
      {
        cor: "Rosa",
        tamanho: "P",
        estoque: 5,
        imagem_url: "/src/assets/img/logo.jpg",
      },
      {
        cor: "Rosa",
        tamanho: "M",
        estoque: 12,
        imagem_url: "/src/assets/img/logo.jpg",
      },
      {
        cor: "Azul",
        tamanho: "M",
        estoque: 8,
        imagem_url: "/src/assets/img/logo.jpg",
      },
      {
        cor: "Azul",
        tamanho: "G",
        estoque: 0,
        imagem_url: "/src/assets/img/logo.jpg",
      },
    ],
  },
  {
    id: 2,
    nome: "Calça Alfaiataria Rose",
    descricao:
      "Calça de alfaiataria com corte reto, cintura alta e bolsos faca.",
    preco: 180.0,
    categoria: "Calças",
    variantes: [
      {
        cor: "Rose",
        tamanho: "M",
        estoque: 7,
        imagem_url: "/src/assets/img/logo.jpg",
      },
      {
        cor: "Rose",
        tamanho: "G",
        estoque: 4,
        imagem_url: "/src/assets/img/logo.jpg",
      },
      {
        cor: "Preto",
        tamanho: "P",
        estoque: 3,
        imagem_url: "/src/assets/img/logo.jpg",
      },
    ],
  },
  {
    id: 3,
    nome: "Blusa Básica Algodão",
    descricao:
      "Blusa t-shirt 100% algodão egípcio.",
    preco: 60.0,
    categoria: "Blusas",
    variantes: [
      {
        cor: "Branco",
        tamanho: "P",
        estoque: 20,
        imagem_url: "/src/assets/img/logo.jpg",
      },
      {
        cor: "Branco",
        tamanho: "M",
        estoque: 25,
        imagem_url: "/src/assets/img/logo.jpg",
      },
    ],
  },
];

// Renderização
function renderizarProdutos(lista) {
  const container = document.getElementById("product-catalog-grid");
  const template = document.getElementById("template-card");
  const txtContador = document.querySelector(".products-count strong");

  if (!container || !template) return;

  container.innerHTML = "";

  if (txtContador) {
    txtContador.textContent = lista.length;
  }

  if (lista.length === 0) {
    container.innerHTML = `
      <p class="no-products">
        Nenhum produto encontrado para os filtros selecionados.
      </p>
    `;
    return;
  }

  lista.forEach((produto) => {
    const clone = template.content.cloneNode(true);

    const precoFormatado = produto.preco.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    const imagemProduto = "../../assets/img/logo.jpg";

    clone.querySelector(".produto-nome").textContent = produto.nome;
    clone.querySelector(".produto-preco").textContent = precoFormatado;

    const imagem = clone.querySelector(".produto-img");
    imagem.src = imagemProduto;
    imagem.alt = produto.nome;

    clone.querySelector(".add-btn").addEventListener("click", () => {
      showSnackbar(`Adicionado: ${produto.nome}`, "success");
    });

    clone
      .querySelector(".open-modal-trigger")
      .addEventListener("click", () => {
        openProductModal(produto);
      });

    container.appendChild(clone);
  });
}

// Filtros e Ordenação
function aplicarFiltrosEOrdenacao() {
  let produtosFiltrados = [...produtos];

  // Categorias
  const checkboxes = document.querySelectorAll(
    '.filter-list input[type="checkbox"]'
  );

  const todosChecked = checkboxes[0]?.checked;

  if (!todosChecked) {
    const categoriasSelecionadas = Array.from(checkboxes)
      .filter((cb, index) => index > 0 && cb.checked)
      .map((cb) =>
        cb.parentElement.textContent.trim().toLowerCase()
      );

    if (categoriasSelecionadas.length > 0) {
      produtosFiltrados = produtosFiltrados.filter((produto) =>
        categoriasSelecionadas.includes(
          produto.categoria.toLowerCase()
        )
      );
    } else {
      produtosFiltrados = [];
    }
  }

  // Preço
  const sliderPreco = document.getElementById("price-slider");

  if (sliderPreco) {
    const precoMaximo = Number(sliderPreco.value);

    produtosFiltrados = produtosFiltrados.filter(
      (produto) => produto.preco <= precoMaximo
    );
  }

  // Tamanho
  const chipAtivo = document.querySelector(".size-chip.active");

  if (chipAtivo) {
    const tamanhoSelecionado =
      chipAtivo.textContent.trim();

    produtosFiltrados = produtosFiltrados.filter((produto) =>
      produto.variantes.some(
        (variante) =>
          variante.tamanho === tamanhoSelecionado
      )
    );
  }

  // Ordenação
  const selectOrdenacao =
    document.getElementById("sort-select");

  if (selectOrdenacao) {
    switch (selectOrdenacao.value) {
      case "price-asc":
        produtosFiltrados.sort(
          (a, b) => a.preco - b.preco
        );
        break;

      case "price-desc":
        produtosFiltrados.sort(
          (a, b) => b.preco - a.preco
        );
        break;
    }
  }

  renderizarProdutos(produtosFiltrados);
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  renderizarProdutos(produtos);

  const sliderPreco =
    document.getElementById("price-slider");

  const txtPrecoValue =
    document.getElementById("price-value");

  if (sliderPreco && txtPrecoValue) {
    txtPrecoValue.textContent = `Até R$ ${Number(
      sliderPreco.value
    )
      .toFixed(2)
      .replace(".", ",")}`;

    sliderPreco.addEventListener("input", (e) => {
      const valor = Number(e.target.value);

      txtPrecoValue.textContent = `Até R$ ${valor
        .toFixed(2)
        .replace(".", ",")}`;

      aplicarFiltrosEOrdenacao();
    });
  }

  const checkboxes = document.querySelectorAll(
    '.filter-list input[type="checkbox"]'
  );

  checkboxes.forEach((checkbox, index) => {
    checkbox.addEventListener("change", () => {
      if (index === 0 && checkbox.checked) {
        checkboxes.forEach((cb, i) => {
          if (i > 0) cb.checked = false;
        });
      } else if (index > 0 && checkbox.checked) {
        checkboxes[0].checked = false;
      }

      aplicarFiltrosEOrdenacao();
    });
  });

  const chipsTamanho =
    document.querySelectorAll(".size-chip");

  chipsTamanho.forEach((chip) => {
    chip.addEventListener("click", () => {
      chipsTamanho.forEach((c) =>
        c.classList.remove("active")
      );

      chip.classList.add("active");

      aplicarFiltrosEOrdenacao();
    });
  });

  const selectOrdenacao =
    document.getElementById("sort-select");

  if (selectOrdenacao) {
    selectOrdenacao.addEventListener(
      "change",
      aplicarFiltrosEOrdenacao
    );
  }
});