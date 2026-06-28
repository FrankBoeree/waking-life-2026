const CACHE_NAME = 'festival-timetable-v5';
const STATIC_CACHE = 'festival-static-v5';
const DATA_CACHE = 'festival-data-v5';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/placeholder.svg',
  '/placeholder-logo.svg',
  '/placeholder-user.jpg',
  '/placeholder.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Always fetch update metadata from the network.
  if (url.pathname === '/sw.js' || url.pathname === '/app-version.json') {
    event.respondWith(fetch(request));
    return;
  }

  // Handle festival data network-first so the refresh button can pick up a new deploy.
  if (url.pathname === '/festival-data.json') {
    event.respondWith(
      caches.open(DATA_CACHE)
        .then((cache) => {
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put('/festival-data.json', networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(async () => {
              const cachedResponse = await cache.match('/festival-data.json');
              return cachedResponse || Response.error();
            });
        })
    );
    return;
  }

  // Navigation: network-first so new deploys reach installed PWAs.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE)
              .then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          return cachedResponse || caches.match('/offline');
        })
    );
    return;
  }

  // Handle static assets
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => cache.put(request, responseClone));
              }
              return networkResponse;
            })
            .catch(() => {
              // Return offline page for navigation requests
              if (request.destination === 'document') {
                return caches.match('/offline');
              }
            });
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any pending offline actions
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'background-sync',
      timestamp: Date.now()
    });
  });
} 
