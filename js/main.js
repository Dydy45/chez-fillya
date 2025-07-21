// Mettre la date d'aujourd'hui comme min
const dateInput = document.querySelector('input[name="date"]');
dateInput.min = new Date().toISOString().split("T")[0];

const form = document.getElementById("booking-form");
const recapTitle = document.getElementById("recap-title");
const recapList = document.getElementById("recap-list");

// Charger les RDV stockés
let bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

function renderRecap() {
  recapList.innerHTML = "";
  if (bookings.length === 0) {
    recapTitle.style.display = "none";
    return;
  }
  recapTitle.style.display = "block";
  bookings.forEach((b, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${b.service} le ${b.date} à ${b.time} pour ${b.name}
      <button data-idx="${idx}">Annuler</button>
    `;
    recapList.appendChild(li);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const booking = {
    service: data.get("service"),
    date: data.get("date"),
    time: data.get("time"),
    name: data.get("name"),
    email: data.get("email"),
  };
  bookings.push(booking);
  localStorage.setItem("bookings", JSON.stringify(bookings));
  form.reset();
  renderRecap();
});

recapList.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;
  const idx = e.target.dataset.idx;
  bookings.splice(idx, 1);
  localStorage.setItem("bookings", JSON.stringify(bookings));
  renderRecap();
});

// Affichage initial
renderRecap();

/* ====== Carte Leaflet ====== */
const SALON = [-4.37663, 15.34197]; // 4,37663° S, 15,34197° E
 // [lat, lng]

// Initialiser la carte
const map = L.map("map").setView(SALON, 15);

// Couche de tuiles OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Marqueur salon
L.marker(SALON)
  .addTo(map)
  .bindPopup("Chez Fillya")
  .openPopup();

// Géolocalisation visiteur
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLatLng = [pos.coords.latitude, pos.coords.longitude];
      L.marker(userLatLng, { icon: userIcon() })
        .addTo(map)
        .bindPopup("Vous êtes ici")
        .openPopup();

      // Ajuster la vue pour inclure les deux points
      const group = new L.featureGroup([
        L.marker(SALON),
        L.marker(userLatLng),
      ]);
      map.fitBounds(group.getBounds().pad(0.1));

      // Distance
      const distance = map.distance(userLatLng, SALON) / 1000; // km
      document.getElementById("distance").textContent =
        `Vous êtes à environ ${distance.toFixed(1)} km du salon.`;
    },
    () => {
      document.getElementById("distance").textContent =
        "Impossible de vous géolocaliser.";
    }
  );
}

// Icône visiteur (petit cercle bleu)
function userIcon() {
  return L.divIcon({
    className: "user-marker",
    html: `<svg width="20" height="20" viewBox="0 0 20 20">
             <circle cx="10" cy="10" r="8" fill="#2563eb" stroke="#fff" stroke-width="2"/>
           </svg>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Bouton Itinéraire
document.getElementById("direction-btn").addEventListener("click", () => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=-4.37663,15.34197`;
  window.open(url, "_blank");
});

/* ===== Avis ===== */
const reviewForm = document.getElementById("review-form");
const reviewsList = document.getElementById("reviews-list");
let reviews = JSON.parse(localStorage.getItem("cf-reviews") || "[]");

function renderReviews() {
  reviewsList.innerHTML = "";
  reviews.forEach(r => {
    const div = document.createElement("div");
    div.className = "review-card";
    div.innerHTML = `
      <strong>${r.name}</strong>
      <span class="stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</span>
      <p>${r.comment}</p>
      <small>${new Date(r.date).toLocaleString()}</small>
    `;
    reviewsList.appendChild(div);
  });
}

reviewForm.addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(reviewForm);
  reviews.unshift({
    name: data.get("name"),
    rating: +data.get("rating"),
    comment: data.get("comment"),
    date: Date.now()
  });
  localStorage.setItem("cf-reviews", JSON.stringify(reviews));
  reviewForm.reset();
  renderReviews();
});

renderReviews();

/* ===== Boutique ===== */
const CATALOG = [
  { id: 1, name: "Shampooing argan", price: 12, stock: 10, img: "img/shampoo.jpeg" },
  { id: 2, name: "Crème coiffante", price: 8, stock: 5, img: "img/cream.jpeg" },
  { id: 3, name: "Gel fixateur", price: 6, stock: 7, img: "img/gel.jpeg" },
];

let cart = JSON.parse(localStorage.getItem('cf-cart') || '[]');

const catalogEl   = document.getElementById('catalog');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout');

/* Rendu catalogue */
function renderCatalog() {
  catalogEl.innerHTML = '';
  CATALOG.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <strong>${p.name}</strong>
      <p>${p.price} USD</p>
      <button ${p.stock ? '' : 'disabled'} data-id="${p.id}">
        ${p.stock ? 'Ajouter' : 'Épuisé'}
      </button>
    `;
    catalogEl.appendChild(div);
  });
}

/* Rendu panier */
function renderCart() {
  cartItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    const product = CATALOG.find(p => p.id === item.id);
    total += product.price * item.qty;
    const li = document.createElement('li');
    li.innerHTML = `
      ${product.name} x${item.qty}
      <button data-remove="${item.id}">🗑</button>
    `;
    cartItemsEl.appendChild(li);
  });
  cartTotalEl.textContent = total;
  checkoutBtn.disabled = cart.length === 0;
  localStorage.setItem('cf-cart', JSON.stringify(cart));
}

/* Ajouter au panier */
catalogEl.addEventListener('click', e => {
  if (!e.target.matches('button[data-id]')) return;
  const id = +e.target.dataset.id;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, qty: 1 });
  renderCart();
});

/* Retirer du panier */
cartItemsEl.addEventListener('click', e => {
  if (!e.target.matches('button[data-remove]')) return;
  const id = +e.target.dataset.remove;
  cart = cart.filter(i => i.id !== id);
  renderCart();
});

/* Commander via WhatsApp */
checkoutBtn.addEventListener('click', () => {
  const text = cart.map(i => {
    const p = CATALOG.find(pr => pr.id === i.id);
    return `${p.name} x${i.qty} = ${p.price * i.qty} USD`;
  }).join('\n');
  const total = cart.reduce((sum, i) => {
    const p = CATALOG.find(pr => pr.id === i.id);
    return sum + p.price * i.qty;
  }, 0);
  const message = encodeURIComponent(
    `Bonjour, je souhaite commander :\n${text}\nTotal : ${total} USD`
  );
  const phone = "243822106496"; // Remplace par le numéro WhatsApp du salon
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
});

/* Init */
renderCatalog();
renderCart();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/chez-fillya/sw.js');
  });
}
