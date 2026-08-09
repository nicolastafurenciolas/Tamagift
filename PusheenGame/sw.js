// sw.js - Service Worker for Offline PWA
const CACHE_NAME = 'saris-pusheen-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './js/game.js',
    './js/minigames.js',
    './manifest.json',
    './assets/images/pusheen-normal.png',
    './assets/images/pusheen-happy.png',
    './assets/images/pusheen-angry.png'
    // El audio se cachea automáticamente de forma dinámica abajo
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    // Estrategia Network-First para assets locales, fallback a caché
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Lo encontró en caché
                }
                return fetch(event.request).then(
                    function (response) {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonar respuesta y guardar en caché (para audios que se agreguen después)
                        var responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            })
    );
});
