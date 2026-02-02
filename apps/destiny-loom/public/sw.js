const CACHE_NAME = "destiny-loom-v2";
const API_CACHE_NAME = "destiny-loom-api-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// App shell routes to cache on first visit
const APP_SHELL_PATTERNS = [
  /\/_next\/static\//,
  /\/fonts\//,
  /\.woff2?$/,
  /\.css$/,
  /\.js$/,
];

// API paths worth caching
const CACHEABLE_API = [
  "/api/zodiac/reading",
  "/api/tarot/draw",
  "/api/i-ching/cast",
  "/api/readings",
  "/api/journal",
  "/api/birth-chart",
];

const API_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "CyberFaith";
  const options = {
    body: data.body || "You have a new notification!",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Handle offline sync queue
self.addEventListener("sync", (event) => {
  if (event.tag === "offline-sync") {
    event.waitUntil(processOfflineQueue());
  }
});

async function processOfflineQueue() {
  // Open IndexedDB and process queued requests
  const db = await openDB();
  const tx = db.transaction("sync-queue", "readwrite");
  const store = tx.objectStore("sync-queue");
  const allKeys = await idbGetAllKeys(store);

  for (const key of allKeys) {
    const item = await idbGet(store, key);
    if (!item) continue;
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });
      if (response.ok) {
        store.delete(key);
      }
    } catch {
      // Still offline, leave in queue
      break;
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("destiny-loom-offline", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("sync-queue")) {
        db.createObjectStore("sync-queue", { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("readings-cache")) {
        db.createObjectStore("readings-cache", { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet(store, key) {
  return new Promise((resolve) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

function idbGetAllKeys(store) {
  return new Promise((resolve) => {
    const req = store.getAllKeys();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve([]);
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: network-first with cache fallback
  if (url.pathname.startsWith("/api/")) {
    const isCacheable =
      request.method === "GET" &&
      CACHEABLE_API.some((p) => url.pathname.startsWith(p));

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && isCacheable) {
            const clone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              const headers = new Headers(clone.headers);
              headers.set("sw-cached-at", Date.now().toString());
              const cachedResponse = new Response(clone.body, {
                status: clone.status,
                statusText: clone.statusText,
                headers,
              });
              cache.put(request, cachedResponse);
            });
          }
          return response;
        })
        .catch(async () => {
          if (isCacheable) {
            const cached = await caches.match(request);
            if (cached) {
              const cachedAt = parseInt(
                cached.headers.get("sw-cached-at") || "0"
              );
              if (Date.now() - cachedAt < API_CACHE_TTL) {
                return cached;
              }
            }
          }
          return new Response(JSON.stringify({ error: "offline" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        })
    );
    return;
  }

  // Navigation: network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigations
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (
          response.ok &&
          request.method === "GET" &&
          (APP_SHELL_PATTERNS.some((p) => p.test(request.url)) ||
            request.url.includes("/icons/"))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Message handler for cache management from the app
self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_READING") {
    // Store reading in IndexedDB for offline access
    openDB().then((db) => {
      const tx = db.transaction("readings-cache", "readwrite");
      tx.objectStore("readings-cache").put(event.data.reading);
    });
  }

  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
