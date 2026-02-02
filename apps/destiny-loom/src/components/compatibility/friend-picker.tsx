"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@cyberfaith/ui";

interface Friend {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Props {
  onSelect: (friendId: string) => void;
  onClose: () => void;
}

export function FriendPicker({ onSelect, onClose }: Props) {
  const t = useTranslations("compatibility");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    fetch("/api/friends", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        setFriends(data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{t("selectFriend")}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">{t("loadingFriends")}</div>
          ) : friends.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">{t("noFriends")}</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {friends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onSelect(f.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  {f.avatarUrl ? (
                    <img src={f.avatarUrl} alt="" className="w-9 h-9 rounded-full" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                      {(f.name || f.email || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
