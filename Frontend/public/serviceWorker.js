const CACHE_NAME = "tech-diary-cache-v2"; // Updated cache version
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/app-192x192.png",
  "/icons/app2-512x512.png"
];

// Install event: Caching assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("Service Worker: Opening cache and adding files...");
      try {
        await Promise.all(urlsToCache.map(url => cache.add(url)));
        console.log("Service Worker: All assets cached successfully!");
      } catch (error) {
        console.error("Service Worker: Error caching assets", error);
      }
    })
  );
});

// Fetch event: Serving from cache & handling navigation
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // Serve index.html for navigation requests
    event.respondWith(
      caches.match("/index.html").then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  } else {
    // Serve from cache if available
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Activate event: Remove old caches
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
    })
  );
  console.log("Service Worker: Activated & updated!");
});
