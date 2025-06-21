import './style.css'

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
  initializeTestimonials();
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

// Formulario de reserva (Modificado para fetch POST y para interactuar con los datos)
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
        comments: formData.get('comments'),
      };
      
      submitButton.innerHTML = '🔄 Enviando...';
      submitButton.disabled = true;

      try {
        // fetch - HTTP POST (Requisito de la rúbrica)
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        });

        if (!response.ok) throw new Error('Error en la reserva');

        await response.json(); // Simula recibir la confirmación del servidor

        // Interactuar con los datos ingresados (Requisito de la rúbrica)
        const confirmationMessage = `¡Gracias, ${data.name}! Tu reserva para ${data.people} el ${data.date} ha sido recibida.`;
        showNotification(confirmationMessage, 'success');
        
        this.reset();
        
      } catch (error) {
        showNotification('Hubo un error al enviar tu reserva. Por favor, intenta de nuevo.', 'error');
        console.error(error);
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

// Cargar testimonios dinámicamente (fetch - HTTP GET)
async function initializeTestimonials() {
  const testimonialsContainer = document.getElementById('testimonials-container');
  if (!testimonialsContainer) return;

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users?_limit=3');
    if (!response.ok) throw new Error('Error al cargar los testimonios');
    
    const users = await response.json();
    
    testimonialsContainer.innerHTML = ''; // Limpiar mensaje de "cargando"
    
    users.forEach(user => {
      const testimonialCard = `
        <div class="testimonial-card animate-fade-in-up">
          <div class="flex items-center mb-4">
            <div class="text-yellow-400 text-2xl">⭐⭐⭐⭐⭐</div>
          </div>
          <p class="text-gray-600 mb-4">"${user.company.catchPhrase}. ¡Una experiencia increíble y un servicio excepcional!"</p>
          <div class="flex items-center">
            <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mr-3">${user.name.charAt(0)}</div>
            <div>
              <p class="font-semibold text-gray-800">${user.name}</p>
              <p class="text-sm text-gray-500">Cliente Satisfecho</p>
            </div>
          </div>
        </div>
      `;
      testimonialsContainer.insertAdjacentHTML('beforeend', testimonialCard);
    });
  } catch (error) {
    testimonialsContainer.innerHTML = '<p class="text-center col-span-full text-red-500">No se pudieron cargar los testimonios en este momento.</p>';
    console.error(error);
  }
}

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