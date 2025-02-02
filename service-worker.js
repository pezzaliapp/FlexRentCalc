// service-worker.js
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("flexrentcalc-cache").then((cache) => {
            return cache.addAll([
                "./",
                "./index.html",
                "./style.css",
                "./app.js",
                "./manifest.json"
            ]);
        })
    );
    self.skipWaiting(); // Forza l'attivazione immediata del nuovo service worker
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim()); // Garantisce il controllo immediato della PWA da parte del nuovo SW
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
