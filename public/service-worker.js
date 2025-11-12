// Service Worker for Inlits
const CACHE_NAME = 'inlits-cache-v1.0.4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches and force update
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // Force immediate control of all clients
      return self.clients.claim();
    }).then(() => {
      // Notify all clients to reload for the new version
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'CACHE_UPDATED',
            version: '1.0.4'
          });
        });
      });
    })
  );
});

// Network-first strategy for API requests
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache-first strategy for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // For navigation requests, return the offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip Supabase API requests (let them be handled by the Supabase client)
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // For navigation requests, use network-first
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // For static assets, use cache-first
  if (
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // For everything else, use network-first
  event.respondWith(networkFirst(event.request));
});

// Handle connectivity changes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CONNECTIVITY_CHANGE') {
    console.log('Service Worker received connectivity change:', event.data.online);
    
    // If back online, sync any pending requests
    if (event.data.online) {
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'CONNECTIVITY_RESTORED'
          });
        });
      });
    }
  }
});