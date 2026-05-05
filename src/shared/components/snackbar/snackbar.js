// Caminho: shared/components/snackbar/snackbar.js

export function showSnackbar(message, type) {
  const snackbarBox = document.getElementById("snackbarBox");
  if (!snackbarBox) return; // Segurança

  const snackbar = document.createElement("div");
  snackbar.classList.add("snackbar", type);

  // Ícones dependendo do tipo
  const icon =
    type === "success"
      ? "fa-check-circle"
      : type === "error"
        ? "fa-times-circle"
        : "fa-exclamation-circle";

  snackbar.innerHTML = `
        <button class="close-btn">X</button>
        <i class="fas ${icon}"></i> &nbsp; ${message}
    `;

  snackbarBox.appendChild(snackbar);

  snackbar
    .querySelector(".close-btn")
    .addEventListener("click", () => snackbar.remove());

  setTimeout(() => {
    if (snackbar) snackbar.remove();
  }, 3000);
}
