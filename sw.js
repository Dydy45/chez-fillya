const CACHE_NAME = 'cf-v1';
const urlsToCache = [
  '/chez-fillya/',
  '/chez-fillya/index.html',
  '/chez-fillya/css/styles.css',
  '/chez-fillya/js/main.js',
  '/chez-fillya/img/icon-192.png',
  '/chez-fillya/img/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
