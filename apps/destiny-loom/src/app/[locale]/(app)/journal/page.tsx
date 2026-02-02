"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, Button } from "@cyberfaith/ui";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useAuth } from "@cyberfaith/auth-client";

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  anxious: "😰",
  hopeful: "🌟",
  confused: "😵‍💫",
};

const READING_TYPE_ICONS: Record<string, string> = {
  mbti: "🧠",
  tarot: "🃏",
  zodiac: "⭐",
  "i-ching": "☯️",
  "four-pillars": "🏛️",
  dream: "🌙",
};

interface JournalEntry {
  id: string;
  readingId: string;
  content: string;
  mood: string | null;
  createdAt: string;
  updatedAt: string;
  readingType: string;
  readingResult: unknown;
}

export default function JournalPage() {
  const t = useTranslations("journal");
  const { session, isAuthenticated } = useAuth();
  const token = session?.tokens?.accessToken;
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [moodFilter, setMoodFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState<string>("");

  const fetchEntries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (moodFilter) params.set("mood", moodFilter);
      if (typeFilter) params.set("type", typeFilter);
      params.set("limit", "50");

      const res = await fetch(`/api/journal?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch journal:", e);
    } finally {
      setLoading(false);
    }
  }, [token, moodFilter, typeFilter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  async function handleDelete(entryId: string) {
    if (!token) return;
    try {
      await fetch(`/api/journal/${entryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (e) {
      console.error("Failed to delete:", e);
    }
  }

  async function handleUpdate(entryId: string) {
    if (!token) return;
    try {
      const body: Record<string, string> = {};
      if (editContent) body.content = editContent;
      if (editMood) body.mood = editMood;

      const res = await fetch(`/api/journal/${entryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditingId(null);
        fetchEntries();
      }
    } catch (e) {
      console.error("Failed to update:", e);
    }
  }

  if (!token) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <p className="text-muted-foreground">{t("loginRequired")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 pb-24">
      <Breadcrumb current={t("title")} />

      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
          📓 {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={moodFilter}
          onChange={(e) => setMoodFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground"
        >
          <option value="">{t("filters.allMoods")}</option>
          {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => (
            <option key={mood} value={mood}>
              {emoji} {t(`moods.${mood}`)}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground"
        >
          <option value="">{t("filters.allTypes")}</option>
          {Object.entries(READING_TYPE_ICONS).map(([type, icon]) => (
            <option key={type} value={type}>
              {icon} {type}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{READING_TYPE_ICONS[entry.readingType] || "📖"}</span>
                    <span className="text-muted-foreground capitalize">{entry.readingType}</span>
                    {entry.mood && (
                      <span className="text-lg" title={entry.mood}>
                        {MOOD_EMOJIS[entry.mood] || ""}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {editingId === entry.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-24 p-3 rounded-lg bg-background border border-border text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <div className="flex items-center gap-2">
                      {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => (
                        <button
                          key={mood}
                          onClick={() => setEditMood(mood)}
                          className={`text-xl p-1 rounded-lg transition-all ${
                            editMood === mood ? "bg-primary/20 ring-2 ring-primary/50 scale-110" : "hover:bg-muted"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="neon" onClick={() => handleUpdate(entry.id)}>
                        {t("save")}
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingId(null)}>
                        {t("cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(entry.id);
                          setEditContent(entry.content);
                          setEditMood(entry.mood || "");
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ✏️ {t("edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        🗑️ {t("delete")}
                      </button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
