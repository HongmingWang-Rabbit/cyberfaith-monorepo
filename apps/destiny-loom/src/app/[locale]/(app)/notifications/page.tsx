"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";
import { useRouter } from "@/i18n/navigation";

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

const typeIcon: Record<string, string> = {
  follow: "👤", comment: "💬", reaction: "❤️", achievement: "🏆", gift: "🎁", system: "📢",
};

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const router = useRouter();
  const { isAuthenticated, session } = useAuth();
  const token = session?.tokens?.accessToken;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const headers = useCallback(() => {
    const h: Record<string, string> = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchNotifications = useCallback(async (p: number) => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/notifications?page=${p}&limit=20`, { headers: headers() });
      const json = await res.json();
      setNotifications(json.data || []);
      setTotal(json.total || 0);
    } catch {} finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, headers]);

  useEffect(() => { fetchNotifications(page); }, [page, fetchNotifications]);

  const markRead = async (id: string) => {
    await fetch(`${API_URL}/notifications/${id}/read`, { method: "PATCH", headers: headers() });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await fetch(`${API_URL}/notifications/read-all`, { method: "POST", headers: headers() });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (notif: Notification) => {
    if (!notif.read) markRead(notif.id);
    if (notif.linkUrl) router.push(notif.linkUrl as any);
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

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 text-muted-foreground">{t("signInRequired")}</div>
    );
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <button
          onClick={markAllRead}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {t("markAllRead")}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">🔔</p>
          <p>{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`w-full text-left p-4 rounded-lg border transition-all flex items-start gap-3 ${
                notif.read
                  ? "border-border/50 opacity-60 hover:opacity-80"
                  : "border-primary/20 bg-primary/5 hover:bg-primary/10 shadow-sm"
              }`}
            >
              <span className="text-xl mt-0.5">{typeIcon[notif.type] || "📢"}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${notif.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                  {notif.title}
                </p>
                {notif.message && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1.5">{timeAgo(notif.createdAt)}</p>
              </div>
              {!notif.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0 shadow-lg shadow-primary/50" />
              )}
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            ←
          </button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
