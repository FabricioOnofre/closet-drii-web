import { showSnackbar } from "../snackbar/snackbar.js";

let currentProduct = null;
let selectedColor = null;
let selectedSize = null;
let selectedQty = 1;

// Injeta automaticamente o HTML do modal na página assim que o script é importado
async function initModal() {
  if (document.getElementById("product-modal")) return;

  try {
    // Busca o arquivo HTML relativo ao componente compartilhado
    const response = await fetch(
      "../../shared/components/product-modal/product-modal.html",
    );
    const html = await response.text();

    // Insere o modal no fim do body da página corrente
    document.body.insertAdjacentHTML("beforeend", html);
    setupModalEvents();
  } catch (error) {
    console.error("Erro ao carregar o componente global de modal:", error);
  }
}

function setupModalEvents() {
  const modal = document.getElementById("product-modal");
  const btnClose = modal.querySelector(".modal-close-btn");

  btnClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Controles de quantidade
  const inputQty = document.getElementById("modal-qty-input");
  document.getElementById("btn-qty-minus").addEventListener("click", () => {
    if (selectedQty > 1) {
      selectedQty--;
      inputQty.value = selectedQty;
    }
  });

  document.getElementById("btn-qty-plus").addEventListener("click", () => {
    const variante = currentProduct.variantes.find(
      (v) => v.cor === selectedColor && v.tamanho === selectedSize,
    );
    if (variante && selectedQty < variante.estoque) {
      selectedQty++;
      inputQty.value = selectedQty;
    } else {
      showSnackbar("Limite de estoque atingido para esta variação.", "error");
    }
  });

  // Evento de Adicionar ao carrinho
  document
    .getElementById("modal-add-to-cart-btn")
    .addEventListener("click", handleAddToCart);
}

function closeModal() {
  document.getElementById("product-modal").classList.remove("active");
}

// --- ESSA É A FUNÇÃO QUE SERÁ EXPORTADA E CHAMADA PELAS SUAS PÁGINAS (Home, Produtos, etc.) ---
export function openProductModal(produto) {
    currentProduct = produto;
    selectedQty = 1;
    
    const inputQty = document.getElementById('modal-qty-input');
    if (inputQty) inputQty.value = 1;

    // Popula dados básicos
    document.getElementById('modal-product-name').textContent = produto.nome;
    document.getElementById('modal-product-category').textContent = produto.categoria || 'Moda Feminina';
    
    // Trata o preço caso ele venha como string formatada ou número puro
    const precoNum = typeof produto.preco === 'number' ? produto.preco : parseFloat(produto.preco.replace(/[^\d.,]/g, '').replace(',', '.'));
    document.getElementById('modal-product-price').textContent = precoNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    document.getElementById('modal-product-description').textContent = produto.descricao || 'Nenhuma descrição disponível.';

    // 🌟 CORREÇÃO AQUI: Garante compatibilidade com 'variantes' ou 'produto_variantes'
    const listaVariantes = produto.variantes || produto.produto_variantes || [];

    if (listaVariantes.length === 0) {
        // Se o produto não tiver variantes no banco (por ser um dado de teste antigo)
        console.warn(`O produto "${produto.nome}" não possui nenhuma variante cadastrada.`);
        document.getElementById('modal-color-options').innerHTML = '<p class="stock-status">Variações indisponíveis</p>';
        document.getElementById('modal-size-options').innerHTML = '';
        document.getElementById('modal-stock-status').textContent = 'Fora de estoque';
        document.getElementById('modal-add-to-cart-btn').disabled = true;
        
        document.getElementById('product-modal').classList.add('active');
        return;
    }

    // Atualiza a referência global para usar a lista tratada
    currentProduct.variantes = listaVariantes;

    // Processa as cores utilizando a lista segura que acabamos de validar
    const coresUnicas = [...new Set(listaVariantes.map(v => v.cor))];
    buildColorSelectors(coresUnicas);

    // Pré-seleciona a primeira cor do produto
    selectColor(coresUnicas[0]);

    // Exibe o modal aplicando a classe CSS
    document.getElementById('product-modal').classList.add('active');
}

function buildColorSelectors(cores) {
  const container = document.getElementById("modal-color-options");
  container.innerHTML = "";

  cores.forEach((cor) => {
    const btn = document.createElement("button");
    btn.className = "color-btn";
    btn.textContent = cor;
    btn.addEventListener("click", () => selectColor(cor));
    container.appendChild(btn);
  });
}

function selectColor(cor) {
  selectedColor = cor;
  document.getElementById("selected-color-text").textContent = cor;

  document.querySelectorAll(".color-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.textContent === cor);
  });

  const variantesDaCor = currentProduct.variantes.filter((v) => v.cor === cor);

  if (variantesDaCor.length > 0) {
    document.getElementById("modal-product-img").src =
      variantesDaCor[0].imagem_url;
  }

  buildSizeSelectors(variantesDaCor);

  const primeiroComEstoque = variantesDaCor.find((v) => v.estoque > 0);
  if (primeiroComEstoque) {
    selectSize(primeiroComEstoque.tamanho);
  } else {
    selectSize(null);
  }
}

function buildSizeSelectors(variantes) {
  const container = document.getElementById("modal-size-options");
  container.innerHTML = "";

  const tamanhosPadrao = ["P", "M", "G", "GG"];

  tamanhosPadrao.forEach((tam) => {
    const varianteExistente = variantes.find((v) => v.tamanho === tam);
    const btn = document.createElement("button");
    btn.className = "size-btn";
    btn.textContent = tam;

    if (!varianteExistente) {
      btn.classList.add("disabled");
    } else if (varianteExistente.estoque === 0) {
      btn.classList.add("disabled");
    } else {
      btn.addEventListener("click", () => selectSize(tam));
    }

    container.appendChild(btn);
  });
}

function selectSize(tamanho) {
  selectedSize = tamanho;
  document.getElementById("selected-size-text").textContent = tamanho
    ? tamanho
    : "Selecione";

  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.textContent === tamanho);
  });

  updateStockStatus();
}

function updateStockStatus() {
  const txtEstoque = document.getElementById("modal-stock-status");
  const btnCarrinho = document.getElementById("modal-add-to-cart-btn");

  if (!selectedColor || !selectedSize) {
    txtEstoque.textContent = "";
    btnCarrinho.disabled = true;
    return;
  }

  const variante = currentProduct.variantes.find(
    (v) => v.cor === selectedColor && v.tamanho === selectedSize,
  );

  if (variante && variante.estoque > 0) {
    txtEstoque.textContent = `Em estoque (${variante.estoque} unidades disponíveis)`;
    txtEstoque.style.color = "#2e7d32";
    btnCarrinho.disabled = false;
  } else {
    txtEstoque.textContent = "Fora de estoque";
    txtEstoque.style.color = "#c62828";
    btnCarrinho.disabled = true;
  }
}

function handleAddToCart() {
  if (!selectedColor || !selectedSize) {
    showSnackbar("Por favor, selecione cor e tamanho.", "error");
    return;
  }

  const itemCarrinho = {
    produto_id: currentProduct.id,
    nome: currentProduct.nome,
    preco: currentProduct.preco,
    cor: selectedColor,
    tamanho: selectedSize,
    quantidade: selectedQty,
  };

  // Aqui integra com o array global de controle de carrinho do seu projeto
  console.log("Adicionado globalmente:", itemCarrinho);

  showSnackbar(
    `Sucesso! ${selectedQty}x ${currentProduct.nome} adicionado ao carrinho.`,
    "success",
  );
  closeModal();
}

// Executa o carregamento assíncrono do HTML do componente
initModal();
