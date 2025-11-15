const CACHE_NAME = 'campus-cart-v3'; // 
const urlsToCache = [
  '/', // ← Root path, not /campuscart/
  '/index.html',
  '/manifest.json',
  '/sw.js', // ← Add this!
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/images/fc.jpg', // ← Add your actual image files
  '/images/fp.jpg',
  '/images/rc.jpg',
  '/images/eez.jpg',
  '/images/sgo.jpg',
  '/images/ico.jpg'
  // Add ALL your product images here
];

// Install event - cache files
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// Fetch event - serve from cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});