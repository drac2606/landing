// file01.js
import { fetchFakerData } from './functions.js';
import { saveVote, getVotes } from './firebase.js';

const showToast = () => {
  const toast = document.getElementById("toast-interactive");
  if (toast) toast.classList.remove("hidden");
};

const hideToastAfterDelay = (delay = 5000) => {
  const toast = document.getElementById("toast-interactive");
  if (toast) {
    setTimeout(() => toast.classList.add("hidden"), delay);
  }
};

const showVideo = () => {
  const demo = document.getElementById("demo");
  if (demo) {
    demo.addEventListener("click", () => {
      window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
    });
  }
};

const renderCards = (data) => {
  const container = document.getElementById("skeleton-container");
  if (!container) return;

  container.innerHTML = "";

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

const loadData = async () => {
  const url = 'https://fakerapi.it/api/v2/texts?_quantity=10&_characters=120';
  try {
    const result = await fetchFakerData(url);
    if (result.success) {
      renderCards(result.body.data);
    } else {
      console.error('Error al obtener los datos:', result.error);
    }
  } catch (error) {
    console.error('Error inesperado:', error);
  }
};

const enableMenuToggle = () => {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
};

const enableForm = () => {
  const form = document.getElementById('form_voting');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const select = document.getElementById('select_product');
    const nameInput = document.getElementById('name_input');
    if (!select || !nameInput) return;

    const productID = select.value;
    const name = nameInput.value.trim();

    if (!productID || !name) return alert('Por favor, completa todos los campos.');

    const res = await saveVote(productID, name);
    if (res.success) {
      alert(res.message);
      form.reset();
      displayVotes();
    } else {
      alert('Error al registrar el voto.');
    }
  });
};

const displayVotes = async () => {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;

  const result = await getVotes();
  if (!result.success) {
    resultsDiv.innerHTML = '<p class="text-red-500 text-center">Error al obtener los votos</p>';
    return;
  }

  const votes = result.data || {};
  const voteCounts = {};

  Object.values(votes).forEach(vote => {
    if (vote.productID) voteCounts[vote.productID] = (voteCounts[vote.productID] || 0) + 1;
  });

  const products = [
    { id: 'product1', name: 'Producto 1' },
    { id: 'product2', name: 'Producto 2' },
    { id: 'product3', name: 'Producto 3' },
  ];

  let tableHtml = '<table class="min-w-full text-center"><thead><tr><th class="px-4 py-2">Producto</th><th class="px-4 py-2">Total de votos</th></tr></thead><tbody>';

  let hasVotes = false;
  products.forEach(product => {
    const count = voteCounts[product.id] || 0;
    tableHtml += `<tr><td class="border px-4 py-2">${product.name}</td><td class="border px-4 py-2">${count}</td></tr>`;
    if (count > 0) hasVotes = true;
  });

  tableHtml += '</tbody></table>';

  resultsDiv.innerHTML = hasVotes ? tableHtml : '<p class="text-gray-500 text-center mt-16">Aún no hay votos registrados</p>';
};

export const initUI = () => {
  showToast();
  hideToastAfterDelay();
  showVideo();
  loadData();
  enableMenuToggle();
  enableForm();
  displayVotes();
};

