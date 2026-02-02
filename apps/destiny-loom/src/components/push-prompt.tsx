"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@cyberfaith/ui";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushPrompt({ token }: { token?: string | null }) {
  const t = useTranslations("horoscope");
  const [show, setShow] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!token || !("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "granted") {
      setSubscribed(true);
      return;
    }
    if (Notification.permission === "denied") return;

    // Show prompt after 30 seconds (tasteful delay)
    const timer = setTimeout(() => setShow(true), 30000);
    return () => clearTimeout(timer);
  }, [token]);

  const handleSubscribe = useCallback(async () => {
    if (!token) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setShow(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setShow(false);
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as any,
      });

      const key = sub.getKey("p256dh");
      const auth = sub.getKey("auth");
      if (!key || !auth) return;

      const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "";
      await fetch(`${coreApiUrl}/notifications/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: btoa(String.fromCharCode(...new Uint8Array(key))),
          auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
        }),
      });

      setSubscribed(true);
      setShow(false);
    } catch {
      setShow(false);
    }
  }, [token]);

  if (!show || subscribed) return null;

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{t("pushPromptTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("pushPromptDesc")}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShow(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t("pushDismiss")}
          </button>
          <button
            onClick={handleSubscribe}
            className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-md hover:bg-accent/80"
          >
            {t("pushEnable")}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
