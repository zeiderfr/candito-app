const CACHE_NAME = 'candito-cache-v1';
const META_CACHE = 'candito-meta';
const VERSION_URL = '/version.json';
const OFFLINE_URL = '/offline.html';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/manifest.json',
  '/apple-touch-icon.png'
];

// ── INSTALL ───────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  const cacheAssets = caches.open(CACHE_NAME).then(cache => {
    console.log('📦 Pre-caching critical assets');
    return cache.addAll(ASSETS_TO_CACHE);
  });

  const trackInstall = caches.open(META_CACHE).then(cache =>
    cache.match('installed').then(existing => {
      if (existing) {
        // Mise à jour — ne pas skipWaiting, laisser UpdatePrompt gérer.
        // Notifier si l'app est en arrière-plan.
        if (Notification.permission === 'granted') {
          return clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            const isVisible = clientList.some(c => c.visibilityState === 'visible');
            if (isVisible) return;
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
        // Première installation — activer immédiatement.
        self.skipWaiting();
        return cache.put('installed', new Response('true'));
      }
    })
  );

  event.waitUntil(Promise.all([cacheAssets, trackInstall]));
});

// ── ACTIVATE ──────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim()
  );
});

// ── PUSH ─────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, body, icon, url, tag } = data;

    const options = {
      body: body || 'Nouveau message de Candito',
      icon: icon || '/apple-touch-icon.png',
      badge: '/apple-touch-icon.png',
      tag: tag || 'candito-notification',
      renotify: true,
      data: { url: url || '/' }
    };

    event.waitUntil(
      self.registration.showNotification(title || 'Candito', options)
    );
  } catch (err) {
    // Fallback si le push n'est pas du JSON
    event.waitUntil(
      self.registration.showNotification('Candito', {
        body: event.data.text(),
        icon: '/apple-touch-icon.png'
      })
    );
  }
});

// ── NOTIFICATION CLICK ────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Si l'app est déjà ouverte → mettre au premier plan et naviguer
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (client.url !== new URL(targetUrl, self.location.origin).href) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Sinon → ouvrir une nouvelle fenêtre
      return clients.openWindow(targetUrl);
    })
  );
});

// ── FETCH — Network First ─────────────────────────────────────────────
// ... (reste du fichier inchangé)
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
      .catch(() => {
        return caches.match(event.request).then(response => {
          if (response) return response;
          // Si c'est une navigation et qu'on n'a rien, on montre la page offline
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

// ── MESSAGE ───────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
