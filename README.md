# link para o site hospedado no firebase

https://closet-drii-web.web.app

# 🛍️ JJF Solutions - Closet Dri

Projeto de e-commerce desenvolvido como parte do curso de **Análise e Desenvolvimento de Sistemas (ADS)** no **IFSP Campinas**. A plataforma visa atender pequenos negócios, permitindo a visualização de produtos, gerenciamento de carrinho e um fluxo de checkout com envio de comprovante.

---

## 🚀 Tecnologias

Este projeto utiliza tecnologias web fundamentais (Vanilla Stack), mantendo o foco em performance e organização modular sem o uso de frameworks.

* **HTML5**
* **CSS3**
* **JavaScript**

---

## 📁 Estrutura do Projeto

Adotamos a **Screaming Architecture**, onde os arquivos de estilo e lógica ficam próximos de suas respectivas telas dentro da pasta `src/pages`.

```text
src/
├── assets/          # Imagens, logos e ícones
|
├── shared/          # CSS global, variáveis e utilitários JS
|   |
│   ├── global.css
│   └── utils.js
|
└── pages/           # Pastas por contexto (HTML, CSS e JS locais)
    ├── home/
    ├── login/
    ├── carrinho/
    ├── produto/
    ├── checkout/
    └── admin/      
```

---

## 📋 Funcionalidades Planejadas

### 👤 Cliente

* [ ] **Catálogo de Produtos**: Listagem dinâmica via JavaScript
* [ ] **Carrinho de Compras**: Persistência de dados utilizando `localStorage`
* [ ] **Checkout Personalizado**: Sistema de finalização de compra com upload/anexo de comprovante de pagamento
* [ ] **Perfil e Histórico**: Espaço para o cliente acompanhar seus pedidos realizados

### 🛠️ Administrador

* [ ] **Gestão de Inventário**: Adicionar, editar e remover produtos
* [ ] **Aprovação de Pedidos**: Painel para visualizar comprovantes enviados e alterar o status da compra
* [ ] **Relatórios**: Visão geral de vendas e histórico geral

---

## 🛠️ Configuração de Desenvolvimento

Como o projeto utiliza Módulos JavaScript (`type="module"`), é necessário rodar através de um servidor local para evitar erros de CORS.

### 📥 Clone o repositório

```bash
git clone https://github.com/seu-usuario/jjf-solutions.git
```

### ▶️ Execute o projeto

Abra com a extensão **Live Server** no VS Code ou utilize o comando:

```bash
npx serve .
```

---

## 👥 Equipe

* Fabricio Onofre
* Jedson Henrique
* Jonathan Araujo
