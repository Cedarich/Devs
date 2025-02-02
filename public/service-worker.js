/* eslint-env serviceworker */
// The files that should be cached
const CACHE_NAME = "my-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/static/js/bundle.js", // Include your JS files
  "/static/css/main.css", // Include your CSS files
  "./", // Example of static assets (image/logo)
  // Add more resources as necessary
];

// On Install: Cache all the assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// On Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: Serve cached assets when offline
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.hostname === 'firestore.googleapis.com') {
    event.respondWith(fetch(event.request));
    return;
  }
  if (url.pathname.includes('/google.firestore.') || 
      url.pathname.includes('/Listen/') ||
      url.hostname.endsWith('.googleapis.com')) {
    return fetch(event.request);
  }
  if (url.hostname.endsWith('.googleapis.com') || 
      url.pathname.startsWith('/v1/projects/')) {
    return fetch(event.request);
  }
  if (url.hostname.includes('firestore') || 
      url.hostname.includes('identitytoolkit') ||
      url.pathname.includes('/google.firestore.') || 
      url.pathname.includes('/v1/accounts:')) {
    return fetch(event.request);
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Serve cached version
      }
      return fetch(event.request); // If not cached, fetch from the network
    })
  );
});

// Optionally, notify the user when new content is available
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
