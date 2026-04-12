const CACHE_NAME = 'candito-cache-v1';
const VERSION_URL = '/version.json';

// Installation : Mise en cache initiale (en option pour le moment)
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force l'activation immédiate du nouveau Service Worker
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // Prend le contrôle des clients immédiatement
});

// Stratégie de Fetch : Network First (Priorité au réseau pour les mises à jour en direct)
self.addEventListener('fetch', (event) => {
  // Chemin de secours pour les requêtes de navigation (PWA)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Pour tout le reste, on tente le réseau, sinon le cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Optionnel : On pourrait mettre en cache ici pour le mode hors-ligne
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Communication avec l'app pour les mises à jour
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
