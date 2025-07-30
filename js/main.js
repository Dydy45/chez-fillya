// ===== CONFIGURATION GLOBALE =====
const CONFIG = {
  SALON_COORDS: [-4.37663, 15.34197], // Kinshasa
  WHATSAPP_PHONE: "243980166216",
  OPENING_HOURS: {
    weekdays: "9h - 19h",
    sunday: "10h - 17h"
  },
  // Configuration WhatsApp Business API
  WHATSAPP: {
    PHONE_NUMBER: "243800000000", // Numéro WhatsApp du salon
    BUSINESS_NAME: "Chez Fillya",
    SALON_EMAIL: "contact@chezfillya.cd"
  }
};

// ===== UTILITAIRES =====
const Utils = {
  // Animation d'apparition des éléments
  animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });
  },

  // Notification système
  showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageEl = notification.querySelector('.notification-message');
    const iconEl = notification.querySelector('.notification-icon');

    messageEl.textContent = message;
    iconEl.className = `notification-icon fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}`;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
      notification.classList.remove('show');
    }, 4000);
  },

  // Formatage des dates
  formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  },

  // Validation des formulaires
  validateForm(formData) {
    const errors = [];
    
    if (!formData.get('name')?.trim()) {
      errors.push('Le nom est requis');
    }
    
    if (!formData.get('email')?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.get('email'))) {
      errors.push('Email invalide');
    }
    
    if (!formData.get('phone')?.trim()) {
      errors.push('Le téléphone est requis');
    }
    
    return errors;
  }
};

// ===== NAVIGATION MOBILE =====
class MobileNavigation {
  constructor() {
    this.navToggle = document.getElementById('nav-toggle');
    this.navMenu = document.getElementById('nav-menu');
    this.navLinks = document.querySelectorAll('.nav-link');
    
    this.init();
  }

  init() {
    this.navToggle.addEventListener('click', () => this.toggleMenu());
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Fermer le menu au clic en dehors
    document.addEventListener('click', (e) => {
      if (!this.navToggle.contains(e.target) && !this.navMenu.contains(e.target)) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    this.navMenu.classList.toggle('active');
    this.navToggle.classList.toggle('active');
  }

  closeMenu() {
    this.navMenu.classList.remove('active');
    this.navToggle.classList.remove('active');
  }
}

// ===== SYSTÈME DE RÉSERVATION =====
class BookingSystem {
  constructor() {
    this.form = document.getElementById('booking-form');
    this.bookingsList = document.getElementById('bookings-list');
    this.bookingsSummary = document.getElementById('bookings-summary');
    this.bookings = JSON.parse(localStorage.getItem('cf-bookings') || '[]');
    
    this.init();
  }

  init() {
    this.setupDateValidation();
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.renderBookings();
  }

  setupDateValidation() {
    const dateInput = document.querySelector('input[name="date"]');
    const timeInput = document.querySelector('input[name="time"]');
    
    // Date minimum = aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Validation des horaires
    dateInput.addEventListener('change', () => {
      const selectedDate = new Date(dateInput.value);
      const isSunday = selectedDate.getDay() === 0;
      
      if (isSunday) {
        timeInput.min = '10:00';
        timeInput.max = '17:00';
      } else {
        timeInput.min = '09:00';
        timeInput.max = '19:00';
      }
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(this.form);
    const errors = Utils.validateForm(formData);
    
    if (errors.length > 0) {
      Utils.showNotification(errors.join(', '), 'error');
      return;
    }

    const booking = {
      id: Date.now(),
      service: formData.get('service'),
      date: formData.get('date'),
      time: formData.get('time'),
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      message: formData.get('message'),
      createdAt: new Date().toISOString()
    };

    // Afficher un indicateur de chargement
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    submitBtn.disabled = true;

    try {
      // Envoyer par WhatsApp
      await this.sendBookingWhatsApp(booking);
      
      // Sauvegarder localement
      this.bookings.push(booking);
      localStorage.setItem('cf-bookings', JSON.stringify(this.bookings));
      
      this.form.reset();
      this.renderBookings();
      
      Utils.showNotification('✅ Réservation envoyée sur WhatsApp ! Vérifiez votre téléphone.', 'success');
      
    } catch (error) {
      console.error('Erreur envoi réservation:', error);
      Utils.showNotification('❌ Erreur lors de l\'envoi. Veuillez réessayer ou nous contacter directement.', 'error');
    } finally {
      // Restaurer le bouton
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  async sendBookingWhatsApp(booking) {
    // Formater la date en français
    const dateObj = new Date(booking.date);
    const formattedDate = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Créer le message WhatsApp
    const message = this.formatWhatsAppMessage(booking, formattedDate);
    
    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message);
    
    // Créer l'URL WhatsApp
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP.PHONE_NUMBER}?text=${encodedMessage}`;
    
    // Ouvrir WhatsApp dans un nouvel onglet
    window.open(whatsappUrl, '_blank');
    
    // Simuler un délai pour l'expérience utilisateur
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  formatWhatsAppMessage(booking, formattedDate) {
    const serviceNames = {
      'coupe-homme': 'Coupe Homme',
      'coupe-femme': 'Coupe Femme', 
      'extensions': 'Extensions',
      'manucure': 'Manucure',
      'pedicure': 'Pédicure',
      'coloration': 'Coloration'
    };

    const serviceName = serviceNames[booking.service] || booking.service;

    return `🎨 *NOUVELLE RÉSERVATION - CHEZ FILLYA* 🎨

📋 *Détails de la réservation :*
• Service : ${serviceName}
• Date : ${formattedDate}
• Heure : ${booking.time}

👤 *Informations client :*
• Nom : ${booking.name}
• Téléphone : ${booking.phone}
• Email : ${booking.email}

💬 *Message :*
${booking.message || 'Aucun message'}

---
📞 Salon : +${CONFIG.WHATSAPP.PHONE_NUMBER}
📍 Adresse : 10 rue Lukunga, Lemba, Kinshasa
⏰ Horaires : Lundi-Samedi 9h-19h, Dimanche 10h-17h

*Cette réservation a été envoyée depuis le site web de Chez Fillya.*`;
  }

  renderBookings() {
    if (this.bookings.length === 0) {
      this.bookingsSummary.style.display = 'none';
      return;
    }

    this.bookingsSummary.style.display = 'block';
    this.bookingsList.innerHTML = '';

    this.bookings.forEach((booking, index) => {
      const bookingEl = document.createElement('div');
      bookingEl.className = 'booking-item';
      bookingEl.innerHTML = `
        <div class="booking-info">
          <h4>${booking.service}</h4>
          <p><i class="fas fa-calendar"></i> ${Utils.formatDate(booking.date + 'T' + booking.time)}</p>
          <p><i class="fas fa-user"></i> ${booking.name}</p>
        </div>
        <button class="btn btn-secondary" onclick="bookingSystem.cancelBooking(${index})">
          <i class="fas fa-times"></i>
        </button>
      `;
      this.bookingsList.appendChild(bookingEl);
    });
  }

  cancelBooking(index) {
    this.bookings.splice(index, 1);
    localStorage.setItem('cf-bookings', JSON.stringify(this.bookings));
    this.renderBookings();
    Utils.showNotification('Réservation annulée', 'success');
  }
}

// ===== SYSTÈME D'AVIS =====
class ReviewSystem {
  constructor() {
    this.form = document.getElementById('review-form');
    this.reviewsList = document.getElementById('testimonials-list');
    this.reviews = JSON.parse(localStorage.getItem('cf-reviews') || '[]');
    
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.renderReviews();
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(this.form);
    const review = {
      id: Date.now(),
      name: formData.get('name'),
      rating: parseInt(formData.get('rating')),
      comment: formData.get('comment'),
      date: new Date().toISOString()
    };

    this.reviews.unshift(review);
    localStorage.setItem('cf-reviews', JSON.stringify(this.reviews));
    
    this.form.reset();
    this.renderReviews();
    
    Utils.showNotification('Avis publié avec succès !', 'success');
  }

  renderReviews() {
    this.reviewsList.innerHTML = '';
    
    this.reviews.forEach(review => {
      const reviewEl = document.createElement('div');
      reviewEl.className = 'review-card fade-in-up';
      reviewEl.innerHTML = `
        <div class="review-header">
          <span class="review-author">${review.name}</span>
          <span class="review-date">${Utils.formatDate(review.date)}</span>
        </div>
        <div class="review-stars">
          ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
        </div>
        <div class="review-text">${review.comment}</div>
      `;
      this.reviewsList.appendChild(reviewEl);
    });
  }
}

// ===== SYSTÈME DE BOUTIQUE =====
class ShopSystem {
  constructor() {
    this.products = [
      { id: 1, name: "Shampooing Argan Premium", price: 15, stock: 10, img: "img/shampoo.jpeg", description: "Shampooing nourrissant à l'huile d'argan" },
      { id: 2, name: "Crème Coiffante Pro", price: 12, stock: 8, img: "img/cream.jpeg", description: "Crème coiffante professionnelle" },
      { id: 3, name: "Gel Fixateur Fort", price: 8, stock: 15, img: "img/gel.jpeg", description: "Gel fixateur longue tenue" },
      { id: 4, name: "Huile Capillaire", price: 18, stock: 5, img: "img/shampoo.jpeg", description: "Huile nourrissante pour cheveux" },
      { id: 5, name: "Masque Hydratant", price: 22, stock: 7, img: "img/cream.jpeg", description: "Masque hydratant intensif" },
      { id: 6, name: "Sérum Anti-Frisottis", price: 25, stock: 3, img: "img/gel.jpeg", description: "Sérum lissant professionnel" }
    ];
    
    this.cart = JSON.parse(localStorage.getItem('cf-cart') || '[]');
    this.productsGrid = document.getElementById('products-grid');
    this.cartItems = document.getElementById('cart-items');
    this.cartTotal = document.getElementById('cart-total');
    this.checkoutBtn = document.getElementById('checkout-btn');
    
    this.init();
  }

  init() {
    this.renderProducts();
    this.renderCart();
    this.setupEventListeners();
  }

  renderProducts() {
    this.productsGrid.innerHTML = '';
    
    this.products.forEach(product => {
      const productEl = document.createElement('div');
      productEl.className = 'product-card fade-in-up';
      productEl.innerHTML = `
        <img src="${product.img}" alt="${product.name}" class="product-image" loading="lazy">
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-price">${product.price} €</div>
          <button class="btn btn-primary" ${product.stock > 0 ? '' : 'disabled'} data-product-id="${product.id}">
            ${product.stock > 0 ? '<i class="fas fa-plus"></i> Ajouter' : 'Épuisé'}
          </button>
        </div>
      `;
      this.productsGrid.appendChild(productEl);
    });
  }

  renderCart() {
    this.cartItems.innerHTML = '';
    let total = 0;

    this.cart.forEach(item => {
      const product = this.products.find(p => p.id === item.id);
      if (product) {
        total += product.price * item.quantity;
        
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
          <div class="cart-item-info">
            <span class="cart-item-name">${product.name}</span>
            <span class="cart-item-price">${product.price} € x ${item.quantity}</span>
          </div>
          <button class="btn btn-secondary" onclick="shopSystem.removeFromCart(${item.id})">
            <i class="fas fa-trash"></i>
          </button>
        `;
        this.cartItems.appendChild(cartItemEl);
      }
    });

    this.cartTotal.textContent = `${total} €`;
    this.checkoutBtn.disabled = this.cart.length === 0;
    localStorage.setItem('cf-cart', JSON.stringify(this.cart));
  }

  setupEventListeners() {
    this.productsGrid.addEventListener('click', (e) => {
      if (e.target.closest('button[data-product-id]')) {
        const productId = parseInt(e.target.closest('button').dataset.productId);
        this.addToCart(productId);
      }
    });

    this.checkoutBtn.addEventListener('click', () => this.checkout());
  }

  addToCart(productId) {
    const existingItem = this.cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ id: productId, quantity: 1 });
    }
    
    this.renderCart();
    Utils.showNotification('Produit ajouté au panier', 'success');
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.renderCart();
    Utils.showNotification('Produit retiré du panier', 'success');
  }

  checkout() {
    const items = this.cart.map(item => {
      const product = this.products.find(p => p.id === item.id);
      return `${product.name} x${item.quantity} = ${product.price * item.quantity} €`;
    }).join('\n');
    
    const total = this.cart.reduce((sum, item) => {
      const product = this.products.find(p => p.id === item.id);
      return sum + product.price * item.quantity;
    }, 0);
    
    const message = encodeURIComponent(
      `Bonjour ! Je souhaite commander :\n\n${items}\n\nTotal : ${total} €`
    );
    
    window.open(`https://wa.me/${CONFIG.WHATSAPP_PHONE}?text=${message}`, '_blank');
  }
}

// ===== SYSTÈME DE CARTE =====
class MapSystem {
  constructor() {
    this.map = null;
    this.directionBtn = document.getElementById('direction-btn');
    this.distanceEl = document.getElementById('distance');
    
    this.init();
  }

  init() {
    this.initMap();
    this.setupEventListeners();
  }

  initMap() {
    this.map = L.map('map').setView(CONFIG.SALON_COORDS, 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Marqueur du salon
    L.marker(CONFIG.SALON_COORDS)
      .addTo(this.map)
      .bindPopup('<strong>Chez Fillya</strong><br>10 rue Lukunga, Lemba')
      .openPopup();

    // Géolocalisation utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.handleUserLocation(pos),
        () => this.handleLocationError()
      );
    }
  }

  handleUserLocation(pos) {
    const userLatLng = [pos.coords.latitude, pos.coords.longitude];
    
    // Marqueur utilisateur
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `<svg width="20" height="20" viewBox="0 0 20 20">
               <circle cx="10" cy="10" r="8" fill="#2563eb" stroke="#fff" stroke-width="2"/>
             </svg>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    L.marker(userLatLng, { icon: userIcon })
      .addTo(this.map)
      .bindPopup('Vous êtes ici');

    // Ajuster la vue
    const group = new L.featureGroup([
      L.marker(CONFIG.SALON_COORDS),
      L.marker(userLatLng)
    ]);
    this.map.fitBounds(group.getBounds().pad(0.1));

    // Calculer la distance
    const distance = this.map.distance(userLatLng, CONFIG.SALON_COORDS) / 1000;
    this.distanceEl.textContent = `Vous êtes à environ ${distance.toFixed(1)} km du salon.`;
  }

  handleLocationError() {
    this.distanceEl.textContent = 'Impossible de vous géolocaliser.';
  }

  setupEventListeners() {
    this.directionBtn.addEventListener('click', () => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${CONFIG.SALON_COORDS[0]},${CONFIG.SALON_COORDS[1]}`;
      window.open(url, '_blank');
    });
  }
}

// ===== SYSTÈME DE GALERIE =====
class GallerySystem {
  constructor() {
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImg = document.getElementById('lightbox-img');
    this.lightboxClose = document.querySelector('.lightbox-close');
    this.lightboxPrev = document.querySelector('.lightbox-prev');
    this.lightboxNext = document.querySelector('.lightbox-next');
    this.currentIndex = 0;
    this.images = [];
    
    this.init();
  }

  init() {
    this.setupGalleryItems();
    this.setupEventListeners();
  }

  setupGalleryItems() {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    this.images = Array.from(galleryItems).map(img => img.src);
    
    galleryItems.forEach((img, index) => {
      img.addEventListener('click', () => this.openLightbox(index));
    });
  }

  setupEventListeners() {
    this.lightboxClose.addEventListener('click', () => this.closeLightbox());
    this.lightboxPrev.addEventListener('click', () => this.prevImage());
    this.lightboxNext.addEventListener('click', () => this.nextImage());
    
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('active')) return;
      
      switch(e.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowLeft':
          this.prevImage();
          break;
        case 'ArrowRight':
          this.nextImage();
          break;
      }
    });
  }

  openLightbox(index) {
    this.currentIndex = index;
    this.lightboxImg.src = this.images[index];
    this.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  prevImage() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.lightboxImg.src = this.images[this.currentIndex];
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.lightboxImg.src = this.images[this.currentIndex];
  }
}

// ===== NAVIGATION SMOOTH SCROLL =====
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
}

// ===== NAVIGATION ACTIVE =====
class ActiveNavigation {
  constructor() {
    this.navLinks = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('section[id]');
    
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.updateActiveLink());
  }

  updateActiveLink() {
    const scrollPos = window.scrollY + 100;
    
    this.sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        this.navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

// ===== VARIABLES GLOBALES =====
let bookingSystem;
let shopSystem;

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser tous les systèmes
  new MobileNavigation();
  bookingSystem = new BookingSystem();
  const reviewSystem = new ReviewSystem();
  shopSystem = new ShopSystem();
  const mapSystem = new MapSystem();
  const gallerySystem = new GallerySystem();
  new SmoothScroll();
  new ActiveNavigation();
  
  // Animation au scroll
  Utils.animateOnScroll();
  
  // Service Worker pour PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/chez-fillya/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
  
  // Exposition globale
  window.bookingSystem = bookingSystem;
  window.shopSystem = shopSystem;
});
