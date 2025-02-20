const CACHE_NAME = "tech-diary-cache-v3"; // Updated cache version
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/app.png",
  "/icons/app2.png",
  "/screenshots/app2.png",
  "/screenshots/app.png"
];

// Install event: Caching assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("Service Worker: Opening cache and adding files...");
      try {
        await cache.addAll(urlsToCache);
        console.log("Service Worker: All assets cached successfully!");
      } catch (error) {
        console.error("Service Worker: Error caching assets", error);
      }
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Fetch event: Serve from cache or fetch from network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((response) => {
        // Clone the response and cache it dynamically
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === "GET" && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      }).catch(() => {
        console.warn("Service Worker: Fetch failed, serving fallback if available.");
      });
    })
  );
});

// Activate event: Remove old caches and reload
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log("Service Worker: Activated & updated!");
      return self.clients.claim(); // Ensure clients are controlled immediately
    })
  );
});

// Notify clients when new service worker takes control
self.addEventListener("controllerchange", () => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.navigate(client.url));
  });
});
