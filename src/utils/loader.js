document.addEventListener("DOMContentLoaded", () => {
    // 1. Carrega o Header
    fetch("../../shared/components/header/header.html")
        .then(res => res.text())
        .then(data => {
            document.body.insertAdjacentHTML("afterbegin", data);
        })
        .catch(err => console.error("Erro ao carregar o header:", err));

    // 2. Carrega o Snackbar
    fetch("../../shared/components/snackbar/snackbar.html")
        .then(res => res.text())
        .then(data => {
            const placeholder = document.createElement('div');
            placeholder.id = 'snackbar-placeholder';
            placeholder.innerHTML = data;
            document.body.appendChild(placeholder);
        })
        .catch(err => console.error("Erro ao carregar o snackbar:", err));
});