import { inicializarHeader } from "../shared/components/header/header.js";

document.addEventListener("DOMContentLoaded", async () => {
    const HEADER_URL = "../../shared/components/header/header.html";
    const SNACKBAR_URL = "../../shared/components/snackbar/snackbar.html";
    const FOOTER_URL = "../../shared/components/footer/footer.html";
    const PRODUCT_MODAL_URL = "../../shared/components/product-modal/product-modal.html";

    try {
        // 1. Injeta as tags de CSS direto no Head em paralelo para evitar o "FOUC" (Flash of Unstyled Content)
        if (!document.querySelector('link[href*="header.css"]')) {
            document.head.insertAdjacentHTML("beforeend", `
                <link rel="stylesheet" href="../../shared/components/header/header.css">
                <link rel="stylesheet" href="../../shared/components/snackbar/snackbar.css">
                <link rel="stylesheet" href="../../shared/components/footer/footer.css">
                <link rel="stylesheet" href="../../shared/components/product-modal/product-modal.css">
            `);
        }

        // 2. Busca os 4 HTMLs ao mesmo tempo
        const [resHeader, resSnackbar, resFooter, resProductModal] = await Promise.all([
            fetch(HEADER_URL),
            fetch(SNACKBAR_URL),
            fetch(FOOTER_URL),
            fetch(PRODUCT_MODAL_URL)
        ]);

        // 3. Injeta os elementos no DOM
        const headerHtml = await resHeader.text();
        document.body.insertAdjacentHTML("afterbegin", headerHtml);

        const snackbarHtml = await resSnackbar.text();
        const snackbarPlaceholder = document.createElement('div');
        snackbarPlaceholder.id = 'snackbar-placeholder';
        snackbarPlaceholder.innerHTML = snackbarHtml;
        document.body.appendChild(snackbarPlaceholder);

        const footerHtml = await resFooter.text();
        document.body.insertAdjacentHTML("beforeend", footerHtml);

        const productModalHtml = await resProductModal.text();
        const productModalPlaceholder = document.createElement('div');
        productModalPlaceholder.id = 'product-modal-placeholder';
        productModalPlaceholder.innerHTML = productModalHtml;
        document.body.appendChild(productModalPlaceholder);

        inicializarHeader();
    } catch (error) {
        console.error("❌ Erro no carregamento dos componentes:", error);
    }
});
