"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@cyberfaith/auth-client";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type SearchResult = {
  resultType: "reading" | "user";
  id: string;
  readingType?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  author?: { id: string; name: string; username?: string; avatarUrl?: string };
  createdAt?: string;
};

const RECENT_KEY = "cyberfaith-recent-searches";

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 5);
  } catch { return []; }
}

function addRecent(q: string) {
  const list = getRecent().filter((s) => s !== q);
  list.unshift(q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
}

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("search");
  const router = useRouter();
  const { session } = useAuth();
  const token = session?.tokens?.accessToken;
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "readings" | "users">("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const trapRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (open) {
      setRecent(getRecent());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const doSearch = useCallback(async (q: string, t: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}&type=${t}&limit=10`, { headers });
      const json = await res.json();
      setResults(json.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query, type), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, type, doSearch]);

  const handleSelect = (result: SearchResult) => {
    if (query.trim()) addRecent(query.trim());
    onClose();
    if (result.resultType === "user") {
      router.push(`/community/users/${result.id}`);
    } else {
      router.push(`/community/readings/${result.id}`);
    }
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
  };

  if (!open) return null;

  const tabs: { key: "all" | "readings" | "users"; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "readings", label: t("readings") },
    { key: "users", label: t("users") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label={t("placeholder")} onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={trapRef}
        className="relative w-full max-w-lg mx-4 bg-card border border-primary/40 rounded-xl shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 0 30px rgba(168, 85, 247, 0.3), 0 0 60px rgba(168, 85, 247, 0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Neon top border */}
        <div className="h-[2px] bg-gradient-to-r from-primary via-accent to-primary" />

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
          />
          <kbd className="hidden sm:inline-block text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-1 px-4 py-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setType(tab.key)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                type === tab.key
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              {t("searching")}
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              {t("noResults")}
            </div>
          )}

          {!loading && !query.trim() && recent.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground mb-2">{t("recentSearches")}</p>
              {recent.map((q) => (
                <button
                  key={q}
                  onClick={() => handleRecentClick(q)}
                  className="block w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-md transition-colors"
                >
                  🕐 {q}
                </button>
              ))}
            </div>
          )}

          {!loading && results.map((result) => (
            <button
              key={`${result.resultType}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border/50 last:border-0"
            >
              {result.resultType === "user" ? (
                <>
                  {result.avatarUrl ? (
                    <img src={result.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                      {(result.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-foreground font-medium">{result.name}</p>
                    {result.username && <p className="text-xs text-muted-foreground">@{result.username}</p>}
                  </div>
                  <span className="ml-auto text-xs text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full">{t("users")}</span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-sm">
                    {result.readingType === "tarot" ? "🃏" : result.readingType === "mbti" ? "🧠" : result.readingType === "zodiac" ? "⭐" : "🔮"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground font-medium capitalize">{result.readingType} {t("reading")}</p>
                    {result.author && <p className="text-xs text-muted-foreground truncate">{t("by")} {result.author.name}</p>}
                  </div>
                  <span className="ml-auto text-xs text-accent/60 bg-accent/10 px-2 py-0.5 rounded-full shrink-0">{t("readings")}</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
          <kbd className="bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
          <span>{t("shortcutHint")}</span>
        </div>
      </div>
    </div>
  );
}
