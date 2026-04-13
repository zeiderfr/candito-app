const CACHE_NAME = 'candito-cache-v1';
const META_CACHE = 'candito-meta';
const VERSION_URL = '/version.json';

// ── INSTALL ───────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force l'activation immédiate du nouveau Service Worker

  // Détecter si c'est une mise à jour (flag dans le cache)
  event.waitUntil(
    caches.open(META_CACHE).then(cache =>
      cache.match('installed').then(existing => {
        if (existing) {
          // Deuxième install+ → c'est une mise à jour
          return cache.put('is-update', new Response('true'));
        } else {
          // Toute première installation
          return cache.put('installed', new Response('true'));
        }
      })
    )
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() =>
      caches.open(META_CACHE).then(cache =>
        cache.match('is-update').then(isUpdate => {
          if (!isUpdate) return; // Première installation → pas de notification

          cache.delete('is-update'); // Nettoyer le flag

          // Notifier uniquement si l'utilisateur a accordé la permission
          if (Notification.permission !== 'granted') return;

          return self.registration.showNotification('Candito — Mise à jour', {
            body: "Nouvelle version installée. Ouvre l'app pour continuer.",
            icon: '/apple-touch-icon.png',
            badge: '/apple-touch-icon.png',
            tag: 'candito-update',   // Déduplique : 1 seule notif visible à la fois
            renotify: false,
          });
        })
      )
    )
  );
});

// ── NOTIFICATION CLICK ────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Si l'app est déjà ouverte → mettre au premier plan
      const existing = clientList.find(c => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      // Sinon → ouvrir une nouvelle fenêtre
      return clients.openWindow('/');
    })
  );
});

// ── FETCH — Network First ─────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Chemin de secours pour les requêtes de navigation (PWA)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Pour tout le reste : réseau en priorité, cache en fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(() => caches.match(event.request))
  );
});

// ── MESSAGE ───────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
