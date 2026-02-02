"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueue,
  type QueuedRequest,
} from "@/lib/offline-db";

interface UseOfflineSyncReturn {
  isOnline: boolean;
  pendingCount: number;
  queueRequest: (url: string, method: string, body?: unknown) => Promise<void>;
  syncNow: () => Promise<void>;
  isSyncing: boolean;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const goOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      syncPending();
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Check initial queue
    refreshCount();

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshCount = useCallback(async () => {
    try {
      const queue = await getSyncQueue();
      setPendingCount(queue.length);
    } catch {
      // IndexedDB might not be available
    }
  }, []);

  const queueRequest = useCallback(
    async (url: string, method: string, body?: unknown) => {
      const item: QueuedRequest = {
        url,
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null,
        timestamp: Date.now(),
      };
      await addToSyncQueue(item);
      await refreshCount();

      // Try background sync if available
      if ("serviceWorker" in navigator && "sync" in (window as unknown as { SyncManager?: unknown }).constructor) {
        try {
          const reg = await navigator.serviceWorker.ready;
          await (reg as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register("offline-sync");
        } catch {
          // Background sync not supported, will sync manually
        }
      }
    },
    [refreshCount]
  );

  const syncPending = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      const queue = await getSyncQueue();
      let allSuccess = true;

      for (const item of queue) {
        try {
          const response = await fetch(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.body,
          });
          if (!response.ok) {
            allSuccess = false;
            break;
          }
        } catch {
          allSuccess = false;
          break;
        }
      }

      if (allSuccess) {
        await clearSyncQueue();
      }
      await refreshCount();
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [refreshCount]);

  return {
    isOnline,
    pendingCount,
    queueRequest,
    syncNow: syncPending,
    isSyncing,
  };
}
