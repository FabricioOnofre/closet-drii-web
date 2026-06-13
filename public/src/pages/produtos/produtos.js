import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";
import { openProductModal } from "../../shared/components/product-modal/product-modal.js";
import { database } from "../../utils/firebase-config.js";

import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Estado global para armazenar os produtos carregados do banco
let produtos = [];

export async function buscarProdutosEstruturados() {
  try {
    // 1. Busca todos os documentos das 3 coleções em paralelo
    const [produtosSnapshot, categoriasSnapshot, variantesSnapshot] =
      await Promise.all([
        getDocs(collection(database, "produtos")),
        getDocs(collection(database, "categorias")),
        getDocs(collection(database, "produto_variantes")),
      ]);

    // 2. Mapeia as categorias { "1": "Vestidos", "2": "Blusas" }
    const categoriasMap = {};
    categoriasSnapshot.forEach((docSnap) => {
      categoriasMap[docSnap.id] = docSnap.data().nome;
    });

    // 3. Mapeia as variantes agrupando-as por 'produto_id'
    const variantesPorProdutoMap = {};
    variantesSnapshot.forEach((docSnap) => {
      const varianteData = docSnap.data();
      const prodId = varianteData.produto_id;

      if (!variantesPorProdutoMap[prodId]) {
        variantesPorProdutoMap[prodId] = [];
      }

      variantesPorProdutoMap[prodId].push({
        id: docSnap.id, // ID da variante (FK do SQL) vindo do documento Firestore
        cor: varianteData.cor,
        tamanho: varianteData.tamanho,
        estoque: Number(varianteData.estoque),
        imagem_url: varianteData.imagem_url,
      });
    });

    // 4. Monta o array final de produtos
    const listaProdutosFormatada = [];
    produtosSnapshot.forEach((docSnap) => {
      const produtoData = docSnap.data();
      const produtoId = docSnap.id;

      listaProdutosFormatada.push({
        id: Number(produtoId),
        nome: produtoData.nome,
        descricao: produtoData.descricao,
        preco: Number(produtoData.preco),
        categoria: categoriasMap[produtoData.categoria_id] || "Sem Categoria",
        variantes: variantesPorProdutoMap[produtoId] || [],
      });
    });

    // Ordena pelo ID para manter a consistência do seu SQL original
    return listaProdutosFormatada.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("❌ Erro ao buscar e estruturar produtos:", error);
    return [];
  }
}

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

    // Imagem padrão caso o produto não tenha nenhuma variante com imagem
    const imagemProdutoPadrao = "../../assets/img/logo.jpg";
    // Tenta pegar a imagem da primeira variante, se existir
    const imagemMostrada = (produto.variantes && produto.variantes.length > 0 && produto.variantes[0].imagem_url) 
                          ? produto.variantes[0].imagem_url 
                          : imagemProdutoPadrao;

    const txtNome = clone.querySelector(".produto-nome");
    if (txtNome) txtNome.textContent = produto.nome;

    const txtPreco = clone.querySelector(".produto-preco");
    if (txtPreco) txtPreco.textContent = precoFormatado;

    const imagem = clone.querySelector(".produto-img");
    if (imagem) {
      imagem.src = imagemMostrada;
      imagem.alt = produto.nome;
    }

    // --- Nova Função Centralizada para Abrir Modal ---
    const handleAbrirModal = () => {
      openProductModal(produto); // Passa o objeto completo do produto para o modal
    };

    // --- EVENTO 1: Clicar no botão "Adicionar" agora ABRE O MODAL ---
    const btnAdd = clone.querySelector(".add-btn");
    if (btnAdd) {
      btnAdd.addEventListener("click", handleAbrirModal);
    }

    // --- EVENTO 2: Clicar na imagem ou no nome também ABRE O MODAL (Comportamento original) ---
    // Supondo que você tenha uma classe 'open-modal-trigger' em volta da imagem/texto ou use o próprio card
    const triggersModal = clone.querySelectorAll(".open-modal-trigger, .produto-img, .produto-nome");
    triggersModal.forEach(trigger => {
        trigger.addEventListener("click", handleAbrirModal);
    });

    container.appendChild(clone);
  });
}

// Filtros e Ordenação
function aplicarFiltrosEOrdenacao() {
  let produtosFiltrados = [...produtos];

  // Filtro de Categorias
  const checkboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
  const todosChecked = checkboxes[0]?.checked;

  if (!todosChecked) {
    const categoriasSelecionadas = Array.from(checkboxes)
      .filter((cb, index) => index > 0 && cb.checked)
      .map((cb) => cb.parentElement.textContent.trim().toLowerCase());

    if (categoriasSelecionadas.length > 0) {
      produtosFiltrados = produtosFiltrados.filter((produto) =>
        categoriasSelecionadas.includes(produto.categoria.toLowerCase()),
      );
    } else {
      produtosFiltrados = [];
    }
  }

  // Filtro de Preço
  const sliderPreco = document.getElementById("price-slider");
  if (sliderPreco) {
    const precoMaximo = Number(sliderPreco.value);
    produtosFiltrados = produtosFiltrados.filter(
      (produto) => produto.preco <= precoMaximo,
    );
  }

  // Filtro de Tamanho
  const chipAtivo = document.querySelector(".size-chip.active");
  if (chipAtivo) {
    const tamanhoSelecionado = chipAtivo.textContent.trim();
    produtosFiltrados = produtosFiltrados.filter((produto) =>
      produto.variantes.some(
        (variante) => variante.tamanho === tamanhoSelecionado,
      ),
    );
  }

  // Ordenação
  const selectOrdenacao = document.getElementById("sort-select");
  if (selectOrdenacao) {
    switch (selectOrdenacao.value) {
      case "price-asc":
        produtosFiltrados.sort((a, b) => a.preco - b.preco);
        break;
      case "price-desc":
        produtosFiltrados.sort((a, b) => b.preco - a.preco);
        break;
    }
  }

  renderizarProdutos(produtosFiltrados);
}

// Inicialização da Página
document.addEventListener("DOMContentLoaded", async () => {
  // Salva o retorno do banco na nossa variável global
  produtos = await buscarProdutosEstruturados();
  renderizarProdutos(produtos);

  // Configuração do Slider de Preço
  const sliderPreco = document.getElementById("price-slider");
  const txtPrecoValue = document.getElementById("price-value");

  if (sliderPreco && txtPrecoValue) {
    txtPrecoValue.textContent = `Até R$ ${Number(sliderPreco.value).toFixed(2).replace(".", ",")}`;

    sliderPreco.addEventListener("input", (e) => {
      const valor = Number(e.target.value);
      txtPrecoValue.textContent = `Até R$ ${valor.toFixed(2).replace(".", ",")}`;
      aplicarFiltrosEOrdenacao();
    });
  }

  // Lógica dos Checkboxes de Categoria
  const checkboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
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

  // Lógica dos Chips de Tamanho
  const chipsTamanho = document.querySelectorAll(".size-chip");
  chipsTamanho.forEach((chip) => {
    chip.addEventListener("click", () => {
      chipsTamanho.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      aplicarFiltrosEOrdenacao();
    });
  });

  // Evento do Select de Ordenação
  const selectOrdenacao = document.getElementById("sort-select");
  if (selectOrdenacao) {
    selectOrdenacao.addEventListener("change", aplicarFiltrosEOrdenacao);
  }
});