"use strict";

import { fetchFakerData } from './functions.js';

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

/**
 * Renderiza tarjetas de contenido con los datos proporcionados.
 *
 * @param {Array} data - Arreglo de objetos con las claves title, author, genre y content.
 * @returns {void}
 */
const renderCards = (data) => {
    const container = document.getElementById("skeleton-container");
    if (!container) return;

    container.innerHTML = ""; // Limpiar contenido previo

    data.slice(0, 3).forEach(item => {
        const card = `
            <div class="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
                <div class="w-full h-40 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-xl font-bold text-blue-800 dark:text-blue-200">
                    ${item.genre}
                </div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">${item.title}</h2>
                <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Autor: ${item.author}</h3>
                <p class="text-sm text-gray-700 dark:text-gray-300">${item.content}</p>
            </div>
        `;
        container.innerHTML += card;
    });
};

/**
 * Carga los datos desde la API y los muestra en consola o error.
 *
 * @returns {void}
 */
const loadData = async () => {
    const url = 'https://fakerapi.it/api/v2/texts?_quantity=10&_characters=120';

    try {
        const result = await fetchFakerData(url);

        if (result.success) {
            console.log('Datos obtenidos con éxito:', result.body);
            renderCards(result.body.data); // 👈 Aquí se llama a renderCards
        } else {
            console.error('Error al obtener los datos:', result.error);
        }

    } catch (error) {
        console.error('Ocurrió un error inesperado:', error);
    }
};

(() => {
  showToast();
  showVideo();
  loadData();
})();
