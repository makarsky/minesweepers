/* sync-sw-assets:start */
const CACHE_NAME = 'minesweeper-f07216e';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/icon-192-maskable.png',
  './icons/icon-192.png',
  './icons/icon-512-maskable.png',
  './icons/icon-512.png',
];
/* sync-sw-assets:end */

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);

    const networked = fetch(event.request).then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(() => cached);

    return cached || networked;
  })());
});
