import { database } from "./firebase-config.js";
import { openProductModal } from "../shared/components/product-modal/product-modal.js";
import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

/**
 * 📡 Carrega e monta a estrutura relacional de produtos mesclando Variantes e Categorias
 * @returns {Promise<Array>} Lista estruturada de produtos prontos para consumo
 */
export async function buscarProdutosEstruturados() {
  try {
    const [produtosSnapshot, categoriasSnapshot, variantesSnapshot] = await Promise.all([
      getDocs(collection(database, "produtos")),
      getDocs(collection(database, "categorias")),
      getDocs(collection(database, "produto_variantes"))
    ]);

    // Mapeia IDs de categorias para Nomes O(1)
    const categoriasMap = {};
    categoriasSnapshot.forEach(docSnap => {
      categoriasMap[docSnap.id] = docSnap.data().nome;
    });

    // Agrupa variantes por produto_id
    const variantesPorProdutoMap = {};
    variantesSnapshot.forEach(docSnap => {
      const varianteData = docSnap.data();
      const prodId = varianteData.produto_id;

      if (!variantesPorProdutoMap[prodId]) {
        variantesPorProdutoMap[prodId] = [];
      }

      variantesPorProdutoMap[prodId].push({
        id: docSnap.id,
        cor: varianteData.cor,
        tamanho: varianteData.tamanho,
        estoque: Number(varianteData.estoque),
        imagem_url: varianteData.imagem_url
      });
    });

    // Monta o array final unificado
    const listaCompleta = [];
    produtosSnapshot.forEach(docSnap => {
      const produtoData = docSnap.data();
      const produtoId = docSnap.id;

      listaCompleta.push({
        id: Number(produtoId),
        nome: produtoData.nome,
        descricao: produtoData.descricao,
        preco: Number(produtoData.preco),
        categoria: categoriasMap[produtoData.categoria_id] || "Sem Categoria",
        variantes: variantesPorProdutoMap[produtoId] || []
      });
    });

    return listaCompleta;

  } catch (error) {
    console.error("❌ Erro ao cruzar dados relacionais no helper:", error);
    throw error;
  }
}

/**
 * 🎨 Renderiza cartões de produtos genéricos em qualquer grid usando <template>
 * @param {Array} lista Itens filtrados ou ordenados que vão para a tela
 * @param {string} containerId ID do elemento HTML pai onde a lista entra
 */
export function renderizarComponenteCards(lista, containerId) {
  const container = document.getElementById(containerId);
  const template = document.getElementById("template-card");

  if (!container || !template) return;
  container.innerHTML = ""; // Limpa a área de injeção

  lista.forEach((produto) => {
    const clone = template.content.cloneNode(true);

    clone.querySelector(".produto-nome").textContent = produto.nome;
    clone.querySelector(".produto-preco").textContent = produto.preco.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    // Define imagem principal/padrão
    const imagemPadrao = produto.variantes && produto.variantes[0] && produto.variantes[0].imagem_url
        ? produto.variantes[0].imagem_url
        : "../../assets/img/logo.jpg";
        
    const imgElement = clone.querySelector(".produto-img");
    if (imgElement) {
      imgElement.src = imagemPadrao;
      imgElement.alt = produto.nome;
    }

    // Ações de clique idênticas para manter unificado o comportamento do modal
    clone.querySelector(".open-modal-trigger").addEventListener("click", () => openProductModal(produto));
    clone.querySelector(".add-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openProductModal(produto);
    });

    container.appendChild(clone);
  });
}