const CACHE_NAME = 'emmi-hub-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Skip Firebase Firestore/Auth backend calls from worker caching
  if (
    url.origin.includes('firestore.googleapis.com') ||
    url.origin.includes('identitytoolkit.googleapis.com') ||
    url.origin.includes('firebaseinstallations.googleapis.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached version or fetch from network and cache
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.origin === location.origin || url.origin.includes('cdn') || url.origin.includes('fonts.'))
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If offline and navigating HTML, serve cached index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });

      return cached || fetchPromise;
    })
  );
});
