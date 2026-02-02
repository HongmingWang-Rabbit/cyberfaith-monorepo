"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@cyberfaith/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type Notification = {
  id: string;
  type: string;
  title: string;
  message?: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const t = useTranslations("notifications");
  const router = useRouter();
  const { isAuthenticated, session } = useAuth();
  const token = session?.tokens?.accessToken;
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const headers = useCallback(() => {
    const h: Record<string, string> = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    try {
      const res = await fetch(`${API_URL}/notifications/unread-count`, { headers: headers() });
      const json = await res.json();
      setUnreadCount(json.data?.count ?? 0);
    } catch {}
  }, [isAuthenticated, token, headers]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/notifications?limit=10`, { headers: headers() });
      const json = await res.json();
      setNotifications(json.data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, headers]);

  // Poll unread count every 30s
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch when opened
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: headers(),
      });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "POST",
        headers: headers(),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleClick = (notif: Notification) => {
    if (!notif.read) markRead(notif.id);
    setOpen(false);
    if (notif.linkUrl) router.push(notif.linkUrl as any);
  };

  if (!isAuthenticated) return null;

  const typeIcon: Record<string, string> = {
    follow: "👤",
    comment: "💬",
    reaction: "❤️",
    achievement: "🏆",
    gift: "🎁",
    system: "📢",
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("justNow");
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={t("title")}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-red-500/50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-card border border-primary/30 rounded-xl shadow-2xl overflow-hidden z-50"
          style={{ boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)" }}
        >
          <div className="h-[2px] bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                {t("loading")}
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                {t("empty")}
              </div>
            )}

            {!loading && notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-border/50 last:border-0 transition-colors ${
                  notif.read ? "opacity-60 hover:opacity-80" : "hover:bg-muted/50"
                }`}
              >
                <span className="text-lg mt-0.5">{typeIcon[notif.type] || "📢"}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${notif.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.message}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(notif.createdAt)}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 shadow-lg shadow-primary/50" />
                )}
              </button>
            ))}
          </div>

          <div className="px-4 py-2 border-t border-border">
            <button
              onClick={() => { setOpen(false); router.push("/notifications" as any); }}
              className="w-full text-center text-xs text-primary hover:text-primary/80 transition-colors py-1"
            >
              {t("viewAll")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
