const CACHE_NAME = 'chez-fillya-v2';
const urlsToCache = [
  '/chez-fillya/',
  '/chez-fillya/index.html',
  '/chez-fillya/css/styles.css',
  '/chez-fillya/js/main.js',
  '/chez-fillya/img/hair_man.jpeg',
  '/chez-fillya/img/hair_woman.jpeg',
  '/chez-fillya/img/nails.jpeg',
  '/chez-fillya/img/pedicure.jpeg',
  '/chez-fillya/img/barbershop.jpeg',
  '/chez-fillya/img/hairstyle.jpeg',
  '/chez-fillya/img/shampoo.jpeg',
  '/chez-fillya/img/cream.jpeg',
  '/chez-fillya/img/gel.jpeg',
  '/chez-fillya/img/icon-192.png',
  '/chez-fillya/img/icon-512.png',
  '/chez-fillya/manifest.json'
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Toutes les ressources ont été mises en cache');
        return self.skipWaiting();
      })
  );
});

// Activation du service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activé');
      return self.clients.claim();
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retourner la réponse du cache si elle existe
        if (response) {
          return response;
        }

        // Sinon, faire la requête réseau
        return fetch(event.request)
          .then(response => {
            // Vérifier si la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cloner la réponse car elle ne peut être utilisée qu'une fois
            const responseToCache = response.clone();

            // Mettre en cache la nouvelle réponse
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // En cas d'erreur réseau, retourner une page d'erreur personnalisée
            if (event.request.destination === 'document') {
              return caches.match('/chez-fillya/');
            }
          });
      })
  );
});

// Gestion des messages
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Gestion des notifications push (pour les futures fonctionnalités)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification de Chez Fillya',
    icon: '/chez-fillya/img/icon-192.png',
    badge: '/chez-fillya/img/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir le site',
        icon: '/chez-fillya/img/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/chez-fillya/img/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Chez Fillya', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/chez-fillya/')
    );
  }
});
