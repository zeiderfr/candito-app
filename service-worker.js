const CACHE_NAME = 'candito-cache-v1';
const META_CACHE = 'candito-meta';
const VERSION_URL = '/version.json';

// ── INSTALL ───────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(META_CACHE).then(cache =>
      cache.match('installed').then(existing => {
        if (existing) {
          // C'est une mise à jour, on ne skipWaiting pas pour laisser le choix à l'utilisateur.
          // On affiche la notification si l'app n'est pas au premier plan.
          if (Notification.permission === 'granted') {
            return clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
              const isVisible = clientList.some(client => client.visibilityState === 'visible');
              if (isVisible) return; // Pop-up in-app se chargera de notifier

              return self.registration.showNotification('Candito — Mise à jour', {
                body: "Nouvelle version disponible. Ouvre l'app pour l'installer.",
                icon: '/apple-touch-icon.png',
                badge: '/apple-touch-icon.png',
                tag: 'candito-update',
                renotify: false,
              });
            });
          }
        } else {
          // Toute première installation
          self.skipWaiting();
          return cache.put('installed', new Response('true'));
        }
      })
    )
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim()
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
