const DB_NAME = "destiny-loom-offline";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
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

export interface QueuedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
}

export async function addToSyncQueue(item: QueuedRequest): Promise<void> {
  const db = await openDB();
  const tx = db.transaction("sync-queue", "readwrite");
  tx.objectStore("sync-queue").add(item);
}

export async function getSyncQueue(): Promise<QueuedRequest[]> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction("sync-queue", "readonly");
    const req = tx.objectStore("sync-queue").getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

export async function clearSyncQueue(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction("sync-queue", "readwrite");
  tx.objectStore("sync-queue").clear();
}

export async function cacheReading(reading: { id: string; [key: string]: unknown }): Promise<void> {
  const db = await openDB();
  const tx = db.transaction("readings-cache", "readwrite");
  tx.objectStore("readings-cache").put({ ...reading, cachedAt: Date.now() });

  // Also tell the service worker
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "CACHE_READING",
      reading,
    });
  }
}

export async function getCachedReading(id: string): Promise<unknown | null> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction("readings-cache", "readonly");
    const req = tx.objectStore("readings-cache").get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

export async function getAllCachedReadings(): Promise<unknown[]> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction("readings-cache", "readonly");
    const req = tx.objectStore("readings-cache").getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}
