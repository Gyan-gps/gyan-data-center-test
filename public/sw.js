const CACHE_NAME = "dci-v8-env-aware";
const urlsToCache = [
  "/",
  "/manifest.json",
  "/images/android-chrome-192x192.png",
  "/images/android-chrome-512x512.png",
  "/images/apple-touch-icon.png",
  "/images/favicon-32x32.png",
  "/images/favicon-16x16.png",
  "/images/favicon.ico",
  "/Logo.png",
];

// Check if we're in development mode
const isDevelopment = self.location.hostname === 'localhost' || 
                     self.location.hostname === '127.0.0.1' ||
                     self.location.hostname.includes('192.168.') ||
                     self.location.hostname.includes('10.0.');

// Install event
self.addEventListener("install", (event) => {
  if (isDevelopment) {
    // console.log("Service Worker DISABLED in development mode");
    event.waitUntil(
      Promise.resolve().then(() => {
        self.skipWaiting();
      })
    );
    return;
  }

  // console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching essential resources");
        return Promise.all(
          urlsToCache.map((url) => {
            return cache.add(url).catch((err) => {
              console.log(`Failed to cache ${url}:`, err);
              return Promise.resolve();
            });
          })
        );
      })
      .then(() => {
        // console.log("Service Worker installed - Production mode");
        self.skipWaiting();
      })
      .catch((error) => {
        console.log("Cache install failed:", error);
      })
  );
});

// Fetch event - environment aware
self.addEventListener("fetch", (event) => {
  // In development mode, don't intercept any requests
  if (isDevelopment) {
    // console.log("Service Worker DISABLED - Passthrough for development:", event.request.url);
    return; // Let the request go directly to network
  }

  // Skip Service Worker for streaming endpoints (chat, SSE, websockets)
  if (event.request.url.includes('/api/chat/stream') ||
      event.request.url.includes('/stream') ||
      event.request.url.includes('/sse/') ||
      event.request.url.includes('text/event-stream')) {
    // console.log("Skipping Service Worker for streaming endpoint:", event.request.url);
    return; // Let the request go directly to network without interception
  }

  // Skip caching for /reports/{id} routes
  if (event.request.url.match(/\/reports\/[^\/]+$/)) {
    // console.log("Skipping cache for reports route:", event.request.url);
    return; // Let the request go directly to network without caching
  }

  // Skip Service Worker for all API requests (optional - more aggressive approach)
  // Uncomment this if you want to bypass SW for all API calls
  // if (event.request.url.includes('/api/')) {
  //   return;
  // }

  // Production mode - network first strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        
        // Cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          }).catch((err) => {
            console.log("Failed to cache response:", err);
          });
        }
        
        return response;
      })
      .catch((error) => {
        // Network failed - try cache as fallback
        console.log("Network failed for:", event.request.url, "- trying cache");
        
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log("Serving from cache (offline):", event.request.url);
            return cachedResponse;
          }
          
          // No cache available
          if (event.request.destination === "document") {
            return caches.match("/").then((fallback) => {
              return fallback || new Response("Offline - No cached content available", {
                status: 503,
                statusText: "Service Unavailable"
              });
            });
          }
          
          throw error;
        });
      })
  );
});

// Activate event - environment aware
self.addEventListener("activate", (event) => {
  if (isDevelopment) {
    // console.log("Service Worker DISABLED in development - Cleaning up...");
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log("Deleting cache:", cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log("Development mode - All caches cleared");
        return self.clients.claim();
      })
    );
    return;
  }

  // console.log("Service Worker activating in production mode");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // console.log("Service Worker activated - Production mode ready");
        return self.clients.claim();
      })
  );
});

// Other events - only active in production
self.addEventListener("sync", (event) => {
  if (isDevelopment) {
    // console.log("Service Worker DISABLED - Ignoring sync in development");
    return;
  }
  
  if (event.tag === "background-sync") {
    console.log("Background sync triggered");
    // Handle offline data sync here
  }
});

self.addEventListener("push", (event) => {
  if (isDevelopment) {
    // console.log("Service Worker DISABLED - Ignoring push in development");
    return;
  }

  const options = {
    body: event.data ? event.data.text() : "New update available",
    icon: "/images/android-chrome-192x192.png",
    badge: "/images/favicon-32x32.png",
    vibrate: [100, 50, 100],
    data: {
      url: "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(
      "DCI - Data Center Intelligence",
      options
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  if (isDevelopment) {
    // console.log("Service Worker DISABLED - Ignoring notification click in development");
    return;
  }

  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});
