import { showSnackbar } from "../../shared/components/snackbar/snackbar.js";

const produtos = [
    { nome: 'Vestido Floral', preco: 'R$ 150,00', img: '../../assets/img/logo.jpg' },
    { nome: 'Calça Alfaiataria', preco: 'R$ 180,00', img: '../../assets/img/logo.jpg' },
    { nome: 'Calça Alfaiataria', preco: 'R$ 180,00', img: '../../assets/img/logo.jpg' },
    { nome: 'Calça Alfaiataria', preco: 'R$ 180,00', img: '../../assets/img/logo.jpg' },
    { nome: 'Blusa Básica', preco: 'R$ 60,00', img: '../../assets/img/logo.jpg' }
];

// Função que cria os cards e coloca no container correto
function renderizarProdutos(lista, containerId) {
    const container = document.getElementById(containerId);
    const template = document.getElementById('template-card');

    if (!container || !template) return;

    lista.forEach(produto => {
        // 1. Clona o conteúdo do template
        const clone = template.content.cloneNode(true);

        // 2. Preenche os dados
        clone.querySelector('.produto-nome').textContent = produto.nome;
        clone.querySelector('.produto-preco').textContent = produto.preco;
        clone.querySelector('.produto-img').src = produto.img;
        clone.querySelector('.produto-img').alt = produto.nome;

        // 3. Adiciona evento no botão
        clone.querySelector('.add-btn').addEventListener('click', () => {
            showSnackbar(`Adicionado: ${produto.nome}`, `success`);
        });

        // 4. Injeta no container
        container.appendChild(clone);
    });
}

// Executa a renderização passando a lista e o ID do elemento HTML
document.addEventListener('DOMContentLoaded', () => {
    // Atenção: Use o ID que está no seu HTML
    renderizarProdutos(produtos, 'product-best-seller'); // Destaques
    renderizarProdutos(produtos, 'product-offer');     // Ofertas
});