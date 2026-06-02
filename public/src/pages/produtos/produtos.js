import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";
import { openProductModal } from "../../shared/components/product-modal/product-modal.js";

// 1. Banco de dados fictício expandido para testar os filtros
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
        imagem_url: "../../assets/img/logo.jpg",
      },
      {
        cor: "Rosa",
        tamanho: "M",
        estoque: 12,
        imagem_url: "../../assets/img/logo.jpg",
      },
      {
        cor: "Azul",
        tamanho: "M",
        estoque: 8,
        imagem_url: "../../assets/img/logo.jpg",
      },
      {
        cor: "Azul",
        tamanho: "G",
        estoque: 0,
        imagem_url: "../../assets/img/logo.jpg",
      }, // Esgotado
    ],
  },
  {
    id: 2,
    nome: "Calça Alfaiataria Rose",
    descricao:
      "Calça de alfaiataria com corte reto, cintura alta e bolsos faca. Ideal para looks de trabalho ou eventos casuais chiques.",
    preco: 180.0,
    categoria: "Calças",
    variantes: [
      {
        cor: "Rose",
        tamanho: "M",
        estoque: 7,
        imagem_url: "../../assets/img/logo.jpg",
      },
      {
        cor: "Rose",
        tamanho: "G",
        estoque: 4,
        imagem_url: "../../assets/img/logo.jpg",
      },
      {
        cor: "Preto",
        tamanho: "P",
        estoque: 3,
        imagem_url: "../../assets/img/logo.jpg",
      },
      {
        cor: "Preto",
        tamanho: "M",
        estoque: 15,
        imagem_url: "../../assets/img/logo.jpg",
      },
    ],
  },
  {
    id: 3,
    nome: "Blusa Básica Algodão",
    descricao:
      "Blusa t-shirt 100% algodão egípcio. Toque extremamente macio e durabilidade premium.",
    preco: 60.0,
    categoria: "Blusas",
    variantes: [
      {
        cor: "Branco",
        tamanho: "P",
        estoque: 20,
        imagem_url: "../../assets/img/logo.jpg",
      },
      {
        cor: "Branco",
        tamanho: "M",
        estoque: 25,
        imagem_url: "../../assets/img/logo.jpg",
      },
      {
        cor: "Preto",
        tamanho: "M",
        estoque: 18,
        imagem_url: "../../assets/img/logo.jpg",
      },
    ],
  },
];

// 2. Função principal de renderização (adaptada do seu exemplo)
function renderizarProdutos(lista) {
    const container = document.getElementById('product-catalog-grid');
    const template = document.getElementById('template-card');
    const txtContador = document.querySelector('.products-count strong');

    if (!container || !template) return;

    // Limpa o grid antes de renderizar a lista filtrada/ordenada
    container.innerHTML = '';

    // Atualiza o contador de produtos encontrados
    if (txtContador) txtContador.textContent = lista.length;

    if (lista.length === 0) {
        container.innerHTML = `<p class="no-products">Nenhum produto encontrado para os filtros selecionados.</p>`;
        return;
    }

    lista.forEach(produto => {
        const clone = template.content.cloneNode(true);

        // Formata o preço numérico para moeda local (BRL)
        const precoFormatado = produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        clone.querySelector('.produto-nome').textContent = produto.nome;
        clone.querySelector('.produto-preco').textContent = precoFormatado;
        clone.querySelector('.produto-img').src = produto.img;
        clone.querySelector('.produto-img').alt = produto.nome;

        clone.querySelector('.add-btn').addEventListener('click', () => {
            showSnackbar(`Adicionado: ${produto.nome}`, `success`);
        });

        clone.querySelector('.open-modal-trigger').addEventListener('click', () => {
            openProductModal(produto); // <- Chama o modal passando o objeto do banco
        });

        container.appendChild(clone);
    });
}

// 3. Lógica de Filtros e Ordenação
function aplicarFiltrosEOrdenacao() {
    let produtosFiltrados = [...produtos];

    // --- FILTRO: Categorias (Checkboxes) ---
    const checkboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
    const todosChecked = checkboxes[0]?.checked; // O primeiro checkbox é o "Todos"

    // Se "Todos" não estiver marcado, filtra pelas categorias individuais selecionadas
    if (!todosChecked) {
        const categoriasSelecionadas = Array.from(checkboxes)
            .filter((cb, index) => index > 0 && cb.checked) // Pula o "Todos"
            .map(cb => cb.parentElement.textContent.trim().toLowerCase());

        if (categoriasSelecionadas.length > 0) {
            produtosFiltrados = produtosFiltrados.filter(p => categoriasSelecionadas.includes(p.categoria));
        } else {
            // Se nenhum tiver marcado (nem o todos, nem as categorias), não mostra nada
            produtosFiltrados = [];
        }
    }

    // --- FILTRO: Preço Máximo (Slider/Range) ---
    const sliderPreco = document.getElementById('price-slider');
    if (sliderPreco) {
        const precoMaximo = parseFloat(sliderPreco.value);
        produtosFiltrados = produtosFiltrados.filter(p => p.preco <= precoMaximo);
    }

    // --- FILTRO: Tamanho (Chips) ---
    const chipAtivo = document.querySelector('.size-chip.active');
    if (chipAtivo) {
        const tamanhoSelecionado = chipAtivo.textContent.trim();
        // Acessórios geralmente são tamanho Único (U), então deixamos passar caso queira
        produtosFiltrados = produtosFiltrados.filter(p => p.tamanho === tamanhoSelecionado || p.tamanho === 'U');
    }

    // --- ORDENAÇÃO (Select) ---
    const selectOrdenacao = document.getElementById('sort-select');
    if (selectOrdenacao) {
        const tipoOrdenacao = selectOrdenacao.value;
        
        if (tipoOrdenacao === 'price-asc') {
            produtosFiltrados.sort((a, b) => a.preco - b.preco);
        } else if (tipoOrdenacao === 'price-desc') {
            produtosFiltrados.sort((a, b) => b.preco - a.preco);
        }
        // 'news' e 'best-sellers' manteriam a ordem original do array ou regras personalizadas
    }

    // Renderiza a lista final resultante dos filtros
    renderizarProdutos(produtosFiltrados);
}

// 4. Inicialização dos Ouvintes de Evento (Event Listeners)
document.addEventListener('DOMContentLoaded', () => {
    
    // Inicializa a tela com todos os produtos
    renderizarProdutos(produtos);

    // Ouvinte para o Slider de Preço (atualiza o texto dinamicamente e filtra)
    const sliderPreco = document.getElementById('price-slider');
    const txtPrecoValue = document.getElementById('price-value');
    if (sliderPreco && txtPrecoValue) {
        sliderPreco.addEventListener('input', (e) => {
            const valor = parseFloat(e.target.value);
            txtPrecoValue.textContent = `Até R$ ${valor.toFixed(2).replace('.', ',')}`;
            aplicarFiltrosEOrdenacao();
        });
    }

    // Ouvinte para as Checkboxes de Categoria
    const checkboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
    checkboxes.forEach((cb, index) => {
        cb.addEventListener('change', () => {
            // Comportamento inteligente: Se clicou em "Todos", desmarca o resto. Se clicou no resto, desmarca o "Todos".
            if (index === 0 && cb.checked) {
                checkboxes.forEach((otherCb, i) => { if (i > 0) otherCb.checked = false; });
            } else if (index > 0 && cb.checked) {
                checkboxes[0].checked = false;
            }
            aplicarFiltrosEOrdenacao();
        });
    });

    // Ouvinte para os botões/chips de Tamanho
    const chipsTamanho = document.querySelectorAll('.size-chip');
    chipsTamanho.forEach(chip => {
        chip.addEventListener('click', () => {
            // Remove a classe ativa dos outros e coloca no clicado
            chipsTamanho.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            aplicarFiltrosEOrdenacao();
        });
    });

    // Ouvinte para a mudança no select de ordenação
    const selectOrdenacao = document.getElementById('sort-select');
    if (selectOrdenacao) {
        selectOrdenacao.addEventListener('change', aplicarFiltrosEOrdenacao);
    }
});