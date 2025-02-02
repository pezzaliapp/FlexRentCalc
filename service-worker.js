// service-worker.js

// Forza l'attivazione immediata del nuovo service worker
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Cancellazione cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // In questo esempio si tenta sempre il fetch dalla rete; in caso di errore si risponde dalla cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
