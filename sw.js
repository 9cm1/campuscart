// sw.js - AUTO-CACHE IMAGES VERSION
const CACHE_NAME = 'campus-cart-' + Date.now();
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
  // NO NEED to list all images manually!
];

// Install - cache essential files
self.addEventListener('install', event => {
  console.log('🚀 Service Worker installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - SMART IMAGE CACHING
self.addEventListener('fetch', event => {
  // Handle image requests specially
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('🖼️ Serving cached image:', event.request.url);
            return cachedResponse;
          }
          
          // Not in cache - fetch, cache, and return
          return fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            console.log('💾 Caching new image:', event.request.url);
            return networkResponse;
          }).catch(error => {
            console.log('❌ Image fetch failed:', event.request.url);
            // Return a placeholder image or just let it fail
            return new Response('Image not available', { 
              status: 404,
              statusText: 'Image not found' 
            });
          });
        });
      })
    );
    return;
  }
  
  // For non-image requests - Network First strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses (except images - we handle them above)
        if (response.status === 200 && event.request.url.startsWith('http')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cachedResponse => cachedResponse || new Response('Offline'));
      })
  );
});