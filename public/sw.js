// Petisi Bela Rakyat - Service Worker
// Version: 1.0.0
// Cache strategy:
// - Static assets: cache-first (long-term)
// - Pages: network-first, fallback to cache (with offline page)
// - Images: stale-while-revalidate

const SW_VERSION = "pbr-sw-v2";
const STATIC_CACHE = `${SW_VERSION}-static`;
const PAGE_CACHE = `${SW_VERSION}-pages`;
const IMAGE_CACHE = `${SW_VERSION}-images`;

const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/pbr.png",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/favicon.png",
  "/offline.html",
  "/tentang-kami",
  "/sejarah",
  "/visi-misi",
  "/struktur-organisasi",
  "/pengurus",
  "/dewan-penasehat",
  "/relawan",
  "/kerja-kami",
  "/kampanye",
  "/blog",
  "/news",
  "/galeri",
  "/transparansi",
  "/kontak",
  "/aplikasi",
];

// Install: pre-cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Some assets failed to cache:", err);
      })
    )
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !name.startsWith(SW_VERSION))
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Helper: detect if request is for an image
function isImageRequest(url) {
  return (
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i) ||
    url.pathname.includes("/_next/image")
  );
}

// Helper: detect if request is a page navigation
function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html")
  );
}

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip Next.js HMR / dev requests
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // 1. Static assets (JS, CSS, fonts) - cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // 2. Images - stale-while-revalidate
  if (isImageRequest(url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 3. Page navigations - network-first, fallback to cache, then offline page
  if (isNavigationRequest(request)) {
    event.respondWith(
      caches.open(PAGE_CACHE).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch (err) {
          // Network failed, try cache
          const cached = await cache.match(request);
          if (cached) return cached;
          // Try to serve the cached home page or any cached page
          const fallback = await cache.match("/");
          if (fallback) return fallback;
          // Last resort: offline page
          return caches.match("/offline.html");
        }
      })
    );
    return;
  }

  // 4. Default: try cache first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          if (response.ok && response.type === "basic") {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
      );
    })
  );
});

// Listen for messages from client (e.g., to trigger skipWaiting)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
