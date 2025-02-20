const CACHE_NAME = "tech-diary-cache-v4"; // Updated cache version
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/app.png",
  "/icons/app2.png",
  "/screenshots/app2.png",
  "/screenshots/app.png",
  "/offline.html", // Fallback page
];

// Install event: Caching assets
self.addEventListener("install", async (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // console.log("Service Worker: Caching assets...");
      try {
        await cache.addAll(urlsToCache);
        // console.log("Service Worker: All assets cached successfully!");
      } catch (error) {
        // console.error("Service Worker: Error caching assets", error);
      }
    })()
  );
  self.skipWaiting(); // Activate immediately
});

// Fetch event: Serve from cache or fetch from network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const response = await fetch(event.request);
        if (event.request.method === "GET" && response.status === 200) {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        console.warn("Service Worker: Fetch failed, serving offline fallback.");
        if (event.request.mode === "navigate") {
          return caches.match("/offline.html"); // Serve offline page
        }
      }
    })()
  );
});

// Activate event: Remove old caches and reload
self.addEventListener("activate", async (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
      console.log("Service Worker: Activated & updated!");
      return self.clients.claim(); // Ensure clients are controlled immediately
    })()
  );
});

// Notify clients when a new service worker takes control
self.addEventListener("controllerchange", () => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.navigate(client.url));
  });
});
