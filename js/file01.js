"use strict";

/**
 * Muestra la notificación interactiva agregando la clase 'md:block'.
 * No elimina la clase 'hidden', solo añade la visibilidad para pantallas medianas.
 *
 * @returns {void} No retorna ningún valor.
 */
const showToast = () => {
    const toast = document.getElementById("toast-interactive");
    if (toast) {
        toast.classList.add("md:block");
    }
};

/**
 * Agrega un evento 'click' al elemento con id 'demo' que abre un video de YouTube en una nueva pestaña.
 *
 * @returns {void} No retorna ningún valor.
 */
const showVideo = () => { 
    const demo = document.getElementById("demo");
    if (demo) {
        demo.addEventListener("click", () => {
            window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
        });
    }
};

(() => {
  showToast();
  showVideo();
})();
