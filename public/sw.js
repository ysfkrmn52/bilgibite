// Service Worker for BilgiBite PWA
const CACHE_NAME = 'bilgibite-v1';
const RUNTIME = 'runtime';

// Assets to precache
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/pricing',
  '/turkish-exams',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - precache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
    );
  }
});

// Background sync
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync offline quiz results, user progress, etc.
  try {
    const pendingData = await getStoredData();
    if (pendingData.length > 0) {
      await syncDataWithServer(pendingData);
      await clearStoredData();
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'BilgiBite\'den yeni bir bildirim!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification('BilgiBite', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Skip waiting message
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Utility functions
async function getStoredData() {
  // Get data from IndexedDB or localStorage
  return [];
}

async function syncDataWithServer(data) {
  // Sync with server API
  return Promise.resolve();
}

async function clearStoredData() {
  // Clear synced data
  return Promise.resolve();
}