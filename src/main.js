import './style.css'
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, set, push, get, onValue } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


// Funcionalidad principal cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  initializeMobileMenu();
  initializeSmoothScrolling();
  initializeAnimations();
  initializeToast();
  initializeForm();
  initializeScrollIndicator();
  initializeHoverEffects();
  initializeImageCarousel();
  initializeReservationsDisplay();
  initializeRatingForm();
  initializeTestimonials();
  initializeOpenStatusBadge();
  const yearSpan = document.getElementById('footer-year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});

// Funcionalidad del menú móvil
function initializeMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
      // Cambiar el ícono del botón
      const svg = this.querySelector('svg');
      if (mobileMenu.classList.contains('hidden')) {
        svg.innerHTML = '<path d="M4 6h16M4 12h16M4 18h16"></path>';
      } else {
        svg.innerHTML = '<path d="M6 18L18 6M6 6l12 12"></path>';
      }
    });

    // Cerrar menú al hacer clic en un enlace
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        const svg = menuToggle.querySelector('svg');
        svg.innerHTML = '<path d="M4 6h16M4 12h16M4 18h16"></path>';
      });
    });
  }
}

// Smooth scrolling para enlaces internos
function initializeSmoothScrolling() {
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  internalLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80; // Ajuste para el navbar fijo
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Animaciones de aparición al hacer scroll
function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar elementos para animación
  const animatedElements = document.querySelectorAll('.plato-card, .bebida-item, .testimonial-card, .stats-card');
  animatedElements.forEach(el => {
    observer.observe(el);
  });
}

// Toast notification
function initializeToast() {
  const toast = document.getElementById('toast-interactive');
  if (toast) {
    // Mostrar toast después de 5 segundos
    setTimeout(() => {
      toast.classList.remove('hidden');
    }, 5000);

    // Cerrar toast al hacer clic en "No ahora"
    const noButton = toast.querySelector('button');
    if (noButton) {
      noButton.addEventListener('click', function() {
        toast.classList.add('hidden');
      });
    }

    // Cerrar toast automáticamente después de 10 segundos
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 15000);
  }
}

// Formulario de reserva (Modificado para usar POST/GET con Firebase)
function initializeForm() {
  const reservationForm = document.querySelector('#contacto form');
  if (reservationForm) {
    reservationForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      
      // Recolectar datos del formulario
      const formData = new FormData(this);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        people: formData.get('people'),
        date: formData.get('date'),
        time: formData.get('time'),
        comments: formData.get('comments') || ''
      };
      
      // Validar campos requeridos
      if (!data.name || !data.email || !data.phone || !data.people || !data.date || !data.time) {
        showNotification('Por favor, completa todos los campos requeridos.', 'error');
        return;
      }
      
      submitButton.innerHTML = '🔄 Enviando...';
      submitButton.disabled = true;

      try {
        // POST - Guardar reserva en Firebase
        const reservationsRef = ref(database, 'reservations');
        const newReservationRef = push(reservationsRef);
        const reservationData = {
          ...data,
          id: newReservationRef.key,
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        
        await set(newReservationRef, reservationData);
        
        // GET - Obtener todas las reservas actualizadas
        const getReservationsRef = ref(database, 'reservations');
        const snapshot = await get(getReservationsRef);
        
        if (snapshot.exists()) {
          const reservations = snapshot.val();
          const reservationsArray = Object.values(reservations).sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          // Actualizar la UI con los datos obtenidos
          updateReservationsDisplay(reservationsArray);
        }
        
        // Interactuar con los datos ingresados (Requisito de la rúbrica)
        const confirmationMessage = `¡Gracias, ${data.name}! Tu reserva para ${data.people} personas el ${data.date} ha sido confirmada.`;
        showNotification(confirmationMessage, 'success');
        
        this.reset();
        
      } catch (error) {
        showNotification('Hubo un error al enviar tu reserva. Por favor, intenta de nuevo.', 'error');
        console.error('Error submitting form:', error);
      } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      }
    });
  }
}

// Indicador de scroll
function initializeScrollIndicator() {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      scrollIndicator.style.setProperty('--scroll-width', scrollPercent + '%');
    });
  }
}

// Efectos hover mejorados
function initializeHoverEffects() {
  // Efectos para platos
  const platoCards = document.querySelectorAll('.plato-card');
  platoCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-12px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Efectos para bebidas
  const bebidaItems = document.querySelectorAll('.bebida-item');
  bebidaItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-6px)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // Efectos para testimonios
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  testimonialCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
  }`;
  notification.innerHTML = `
    <div class="flex items-center">
      <span class="text-xl mr-2">${type === 'success' ? '✅' : 'ℹ️'}</span>
      <p>${message}</p>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remover notificación después de 3 segundos
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Navbar con efecto de ocultamiento en scroll
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('nav');
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
    // Scrolling down
    navbar.style.transform = 'translateY(-100%)';
  } else {
    // Scrolling up
    navbar.style.transform = 'translateY(0)';
  }
  
  lastScrollTop = currentScrollTop;
});

// Lazy loading para imágenes
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.remove('loading-skeleton');
      }
      observer.unobserve(img);
    }
  });
});

// Observar todas las imágenes para lazy loading
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img[data-src]');
  images.forEach(img => {
    img.classList.add('loading-skeleton');
    imageObserver.observe(img);
  });
});

// Contador de estadísticas animado
function animateCounters() {
  const counters = document.querySelectorAll('.stats-card h3');
  counters.forEach(counter => {
    const target = parseInt(counter.textContent.match(/\d+/)[0]);
    const increment = target / 100;
    let current = 0;
    
    const updateCounter = () => {
      if (current < target) {
        current += increment;
        counter.textContent = Math.ceil(current) + (counter.textContent.includes('+') ? '+' : '');
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target + (counter.textContent.includes('+') ? '+' : '');
      }
    };
    
    updateCounter();
  });
}

// Iniciar animación de contadores cuando las estadísticas sean visibles
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      statsObserver.unobserve(entry.target);
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const statsSection = document.querySelector('.stats-card');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }
});

// Carrusel de imágenes
function initializeImageCarousel() {
  const carouselData = [
    {
      image: '/img/parrillada.jpg',
      title: 'Parrillada Marinera',
      description: 'El favorito de nuestros clientes - Camarones, calamares, pulpo y pescado'
    },
    {
      image: '/img/torre.jpg',
      title: 'Torre de Mariscos',
      description: 'Nuestra especialidad - Variedad de mariscos en torre especial'
    },
    {
      image: '/img/ceviche.jpg',
      title: 'Ceviche Mixto',
      description: 'Nuestro plato estrella - Mariscos frescos marinados en limón'
    },
    {
      image: '/img/langostinos.jpg',
      title: 'Langostinos a la Parrilla',
      description: 'Langostinos frescos a la parrilla con yuca frita y ensalada'
    },
    {
      image: '/img/encocado.jpg',
      title: 'Encocado de Pescado',
      description: 'Pescado cocido en leche de coco con pimientos - Tradición costeña'
    },
    {
      image: '/img/pescado.jpg',
      title: 'Pescado a la Brasa',
      description: 'Pescado entero cocinado al carbón con arroz y ensalada fresca'
    },
    {
      image: '/img/cangrejo.jpg',
      title: 'Cangrejo al Ajillo',
      description: 'Cangrejo salteado en ajo con toque de chile - Delicia costera'
    },
    {
      image: '/img/cazuela.jpg',
      title: 'Cazuela de Mariscos',
      description: 'Mariscos en salsa espesa de maní y verde cocido - Sabor único'
    }
  ];

  let currentIndex = 0;
  const imageElement = document.getElementById('carousel-image');
  const titleElement = document.getElementById('carousel-title');
  const descriptionElement = document.getElementById('carousel-description');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const indicatorsContainer = document.getElementById('indicators');
  const imageCounter = document.getElementById('image-counter');
  const totalImages = document.getElementById('total-images');

  // Actualizar contador total
  if (totalImages) {
    totalImages.textContent = carouselData.length;
  }

  // Crear indicadores
  function createIndicators() {
    indicatorsContainer.innerHTML = '';
    carouselData.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
        index === currentIndex ? 'bg-white' : 'bg-white/50'
      }`;
      indicator.addEventListener('click', () => goToSlide(index));
      indicatorsContainer.appendChild(indicator);
    });
  }

  // Actualizar imagen y contenido
  function updateCarousel() {
    const currentData = carouselData[currentIndex];
    
    // Efecto de fade out
    imageElement.style.opacity = '0';
    
    setTimeout(() => {
      imageElement.src = currentData.image;
      titleElement.textContent = currentData.title;
      descriptionElement.textContent = currentData.description;
      
      // Efecto de fade in
      imageElement.style.opacity = '1';
    }, 300);

    // Actualizar contador
    if (imageCounter) {
      imageCounter.textContent = currentIndex + 1;
    }

    // Actualizar indicadores
    const indicators = indicatorsContainer.querySelectorAll('div');
    indicators.forEach((indicator, index) => {
      indicator.className = `w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
        index === currentIndex ? 'bg-white' : 'bg-white/50'
      }`;
    });
  }

  // Ir a slide específico
  function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
  }

  // Siguiente slide
  function nextSlide() {
    currentIndex = (currentIndex + 1) % carouselData.length;
    updateCarousel();
  }

  // Slide anterior
  function prevSlide() {
    currentIndex = (currentIndex - 1 + carouselData.length) % carouselData.length;
    updateCarousel();
  }

  // Event listeners
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
  }

  // Navegación con teclado
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });

  // Auto-play (opcional - comentado por defecto)
  // let autoPlayInterval = setInterval(nextSlide, 5000);

  // Pausar auto-play al hacer hover
  const carouselContainer = document.querySelector('.aspect-video');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', function() {
      // clearInterval(autoPlayInterval);
    });
    
    carouselContainer.addEventListener('mouseleave', function() {
      // autoPlayInterval = setInterval(nextSlide, 5000);
    });
  }

  // Inicializar carrusel
  createIndicators();
  updateCarousel();
}

// Inicializar display de reservas
function initializeReservationsDisplay() {
  try {
    // Mostrar estado de carga
    const container = document.getElementById('recent-reservations');
    if (container) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="inline-flex items-center space-x-2 text-gray-500">
            <div class="w-6 h-6 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
            <span>Conectando en tiempo real...</span>
          </div>
        </div>
      `;
    }

    // Listener en tiempo real para reservas
    const reservationsRef = ref(database, 'reservations');
    onValue(reservationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const reservations = snapshot.val();
        const reservationsArray = Object.values(reservations).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        updateReservationsDisplay(reservationsArray);
        
        // Mostrar notificación de conexión exitosa solo la primera vez
        if (reservationsArray.length > 0) {
          console.log('✅ Sistema de reservas en tiempo real conectado');
        }
      } else {
        updateReservationsDisplay([]);
        console.log('✅ Sistema de reservas en tiempo real conectado - No hay reservas aún');
      }
    }, (error) => {
      console.error('Error listening to reservations:', error);
      updateReservationsDisplay([]);
      
      // Mostrar error en la UI
      if (container) {
        container.innerHTML = `
          <div class="col-span-full text-center py-12">
            <div class="text-red-500">
              <div class="text-4xl mb-4">⚠️</div>
              <p class="text-lg mb-2">Error de conexión</p>
              <p class="text-sm text-gray-500">No se pudo conectar al sistema de reservas</p>
            </div>
          </div>
        `;
      }
    });
  } catch (error) {
    console.error('Error setting up reservation listener:', error);
    updateReservationsDisplay([]);
  }
}

// Actualizar display de reservas
function updateReservationsDisplay(reservations) {
  const container = document.getElementById('recent-reservations');
  const counter = document.getElementById('reservation-counter');
  const todayCounter = document.getElementById('today-reservations');
  const weekCounter = document.getElementById('week-reservations');
  const avgPartySize = document.getElementById('avg-party-size');
  if (!container) return;
  const currentCount = parseInt(counter?.textContent) || 0;
  const newCount = reservations.length;
  const isNewReservation = newCount > currentCount;
  if (counter) {
    if (currentCount !== newCount) {
      counter.textContent = newCount;
      counter.classList.add('count-animation');
      if (isNewReservation) {
        counter.style.transform = 'scale(1.2)';
        counter.style.color = '#10b981';
        setTimeout(() => {
          counter.style.transform = 'scale(1)';
          counter.style.color = '';
        }, 1000);
      }
      setTimeout(() => counter.classList.remove('count-animation'), 500);
    }
  }
  const today = new Date().toDateString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const todayReservations = reservations.filter(r => new Date(r.createdAt).toDateString() === today);
  const weekReservations = reservations.filter(r => new Date(r.createdAt) >= weekAgo);
  const totalPeople = reservations.reduce((sum, r) => { const people = parseInt(r.people) || 0; return sum + people; }, 0);
  const averagePartySize = reservations.length > 0 ? Math.round(totalPeople / reservations.length) : 0;
  if (todayCounter) {
    const currentToday = parseInt(todayCounter.textContent) || 0;
    if (currentToday !== todayReservations.length) {
      todayCounter.textContent = todayReservations.length;
      todayCounter.classList.add('count-animation');
      setTimeout(() => todayCounter.classList.remove('count-animation'), 500);
    }
  }
  if (weekCounter) {
    const currentWeek = parseInt(weekCounter.textContent) || 0;
    if (currentWeek !== weekReservations.length) {
      weekCounter.textContent = weekReservations.length;
      weekCounter.classList.add('count-animation');
      setTimeout(() => weekCounter.classList.remove('count-animation'), 500);
    }
  }
  if (avgPartySize) {
    const currentAvg = parseInt(avgPartySize.textContent) || 0;
    if (currentAvg !== averagePartySize) {
      avgPartySize.textContent = averagePartySize;
      avgPartySize.classList.add('count-animation');
      setTimeout(() => avgPartySize.classList.remove('count-animation'), 500);
    }
  }
  // Mostrar solo las 3 últimas reservas
  const recentReservations = reservations.slice(0, 3);
  if (recentReservations.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="text-gray-500">
          <div class="text-6xl mb-4">🍽️</div>
          <p class="text-xl mb-2">Aún no hay reservas</p>
          <p class="text-gray-400">¡Sé el primero en reservar!</p>
        </div>
      </div>
    `;
    return;
  }
  container.innerHTML = recentReservations.map((reservation) => {
    const date = new Date(reservation.createdAt);
    const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="reservation-card animate-fade-in-up">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="reservation-avatar">${reservation.name.charAt(0).toUpperCase()}</div>
            <div>
              <h3 class="font-semibold text-gray-800 text-lg">${reservation.name}</h3>
              <p class="text-xs text-gray-500">${reservation.people} personas</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-400">${formattedDate}</div>
            <div class="text-xs text-gray-400">${formattedTime}</div>
          </div>
        </div>
        <div class="space-y-2 text-sm mt-2">
          <div class="flex items-center space-x-2">
            <span class="icon">📅</span>
            <span class="text-gray-700">${reservation.date} a las ${reservation.time}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="icon phone">📞</span>
            <span class="text-gray-700">${reservation.phone}</span>
          </div>
          ${reservation.comments ? `
            <div class="flex items-start space-x-2">
              <span class="icon comment">💬</span>
              <span class="text-gray-700 text-xs">${reservation.comments}</span>
            </div>
          ` : ''}
        </div>
        <div class="mt-4 pt-3 border-t border-gray-100">
          <span class="confirmation-badge"><span class="icon">✅</span>Confirmada</span>
        </div>
      </div>
    `;
  }).join('');
}

// --- Calificaciones y Testimonios ---

// Inicializar formulario de calificación
function initializeRatingForm() {
  const form = document.getElementById('rating-form');
  const starRating = document.getElementById('star-rating');
  if (!form || !starRating) return;
  let currentRating = 0;

  // Renderizar estrellas
  function renderStars() {
    starRating.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = 'text-4xl cursor-pointer select-none transition-all duration-150';
      star.innerHTML = '★';
      // Color solo por selección
      star.style.color = i <= currentRating ? '#ffb300' : '#e5e7eb'; // dorado fuerte y gris claro
      // Efecto visual al pasar el mouse (escala/sombra, no color)
      star.addEventListener('mouseenter', () => {
        star.style.transform = 'scale(1.2)';
        star.style.textShadow = '0 2px 8px #ffb30055';
      });
      star.addEventListener('mouseleave', () => {
        star.style.transform = 'scale(1)';
        star.style.textShadow = 'none';
      });
      star.addEventListener('click', () => {
        currentRating = i;
        renderStars();
      });
      starRating.appendChild(star);
    }
  }
  renderStars();

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = form.elements['name'].value.trim();
    const comment = form.elements['comment'].value.trim();
    const rating = currentRating;
    // Validación robusta
    if (!name || !comment || rating < 1 || rating > 5) {
      showNotification('Por favor, ingresa tu nombre, comentario y selecciona una calificación con estrellas antes de enviar. ¡Tu opinión es muy importante para nosotros!', 'error');
      return;
    }
    try {
      const testimonialsRef = ref(database, 'testimonials');
      const newTestimonialRef = push(testimonialsRef);
      const testimonialData = {
        name,
        comment,
        rating,
        createdAt: new Date().toISOString()
      };
      await set(newTestimonialRef, testimonialData);
      showNotification('¡Gracias por tu opinión! Tu calificación se ha registrado correctamente.', 'success');
      form.reset();
      currentRating = 0;
      renderStars();
    } catch (error) {
      showNotification('Ocurrió un error al enviar tu calificación. Por favor, inténtalo de nuevo.', 'error');
      console.error(error);
    }
  });
}

// Cargar y mostrar testimonios en tiempo real (GET)
function initializeTestimonials() {
  const testimonialsContainer = document.getElementById('testimonials-container');
  if (!testimonialsContainer) return;
  testimonialsContainer.innerHTML = '<p class="text-center col-span-full text-gray-500">Cargando testimonios...</p>';
  try {
    const testimonialsRef = ref(database, 'testimonials');
    onValue(testimonialsRef, (snapshot) => {
      if (snapshot.exists()) {
        let testimonials = Object.values(snapshot.val());
        // Barajar y tomar 3 aleatorios
        testimonials = testimonials.sort(() => Math.random() - 0.5).slice(0, 3);
        testimonialsContainer.innerHTML = testimonials.map(t => `
          <div class="testimonial-card animate-fade-in-up">
            <div class="flex items-center mb-4">
              <div class="text-yellow-400 text-2xl">${renderStarIcons(t.rating)}</div>
            </div>
            <p class="text-gray-600 mb-4">"${t.comment}"</p>
            <div class="flex items-center">
              <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mr-3">${t.name.charAt(0)}</div>
              <div>
                <p class="font-semibold text-gray-800">${t.name}</p>
                <p class="text-sm text-gray-500">Cliente Satisfecho</p>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        testimonialsContainer.innerHTML = '<p class="text-center col-span-full text-gray-500">Sé el primero en dejar tu comentario.</p>';
      }
    });
  } catch (error) {
    testimonialsContainer.innerHTML = '<p class="text-center col-span-full text-red-500">No se pudieron cargar los testimonios en este momento.</p>';
    console.error(error);
  }
}

// Renderizar estrellas para testimonios
function renderStarIcons(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += i <= rating ? '★' : '☆';
  }
  return stars;
}

// Badge dinámico de abierto/cerrado
function initializeOpenStatusBadge() {
  const badge = document.getElementById('open-status-badge');
  const dot = document.getElementById('open-status-dot');
  const text = document.getElementById('open-status-text');
  if (!badge || !dot || !text) return;

  function updateStatus() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    // Abierto de 12:00 a 22:00 todos los días
    const isOpen = (hour > 12 && hour < 22) || (hour === 12 && minute >= 0) || (hour === 22 && minute === 0);
    if (isOpen) {
      dot.classList.remove('bg-red-400');
      dot.classList.add('bg-green-400');
      text.textContent = 'Abierto ahora • Lun-Dom 12:00-22:00';
    } else {
      dot.classList.remove('bg-green-400');
      dot.classList.add('bg-red-400');
      text.textContent = 'Cerrado ahora • Lun-Dom 12:00-22:00';
    }
  }
  updateStatus();
  setInterval(updateStatus, 60000); // Actualiza cada minuto
}