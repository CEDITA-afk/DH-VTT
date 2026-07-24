const CACHE_NAME = 'daggerheart-gm-screen-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Install Event - cache the critical static shells
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline essentials');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up obsolete cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Cleaning old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate and Dynamic Cache Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Exclude non-GET requests, external APIs, and hot reloading websockets
  if (
    request.method !== 'GET' || 
    request.url.includes('/api/') || 
    request.url.includes('chrome-extension:') ||
    request.url.includes('ws://') ||
    request.url.includes('wss://')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch a fresh version in the background to update the cache
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => {
            /* Fail silently if offline during background refresh */
          });
        return cachedResponse;
      }

      // If it is not in cache, fetch from network and dynamically cache
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch((error) => {
          // If completely offline and navigating between pages, fallback to cached main layout
          if (request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          throw error;
        });
    })
  );
});
