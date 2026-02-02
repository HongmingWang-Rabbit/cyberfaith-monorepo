"use client";

import { useOfflineSync } from "@/hooks/useOfflineSync";

export function OfflineBanner() {
  const { isOnline, pendingCount, isSyncing, syncNow } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${
        !isOnline
          ? "bg-gradient-to-r from-amber-600/90 to-orange-600/90 text-white backdrop-blur-sm"
          : "bg-gradient-to-r from-purple-600/90 to-fuchsia-600/90 text-white backdrop-blur-sm"
      }`}
    >
      {!isOnline ? (
        <span>
          📡 You&apos;re offline — cached readings are still available
          {pendingCount > 0 && ` · ${pendingCount} pending sync${pendingCount > 1 ? "s" : ""}`}
        </span>
      ) : (
        <span>
          ⏳ Syncing {pendingCount} queued item{pendingCount > 1 ? "s" : ""}...
          {!isSyncing && (
            <button onClick={syncNow} className="ml-2 underline hover:no-underline">
              Sync now
            </button>
          )}
        </span>
      )}
    </div>
  );
}
