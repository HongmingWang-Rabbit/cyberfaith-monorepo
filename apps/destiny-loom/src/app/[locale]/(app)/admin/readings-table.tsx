"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";

interface AdminReading {
  id: string;
  type: string;
  userId: string;
  isPublic: boolean;
  locale: string | null;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
}

function getToken(): string | null {
  try {
    const stored = localStorage.getItem("cyberfaith_auth");
    if (!stored) return null;
    return JSON.parse(stored).tokens.accessToken;
  } catch {
    return null;
  }
}

export function AdminReadingsTable() {
  const t = useTranslations("admin");
  const [readings, setReadings] = useState<AdminReading[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [publicFilter, setPublicFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    if (!token) return;

    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (typeFilter) params.set("type", typeFilter);
    if (publicFilter) params.set("isPublic", publicFilter);

    const res = await fetch(`/api/admin/readings?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setReadings(data.data || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, typeFilter, publicFilter]);

  useEffect(() => { fetchReadings(); }, [fetchReadings]);

  const deleteReading = async (id: string) => {
    if (!confirm(t("readings.confirmDelete"))) return;
    const token = getToken();
    if (!token) return;

    await fetch(`/api/admin/readings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchReadings();
  };

  const totalPages = Math.ceil(total / 20);
  const types = ["mbti", "tarot", "i-ching", "four-pillars", "zodiac"];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-card/50 text-foreground focus:outline-none focus:border-primary text-sm"
        >
          <option value="">{t("readings.allTypes")}</option>
          {types.map((tp) => (
            <option key={tp} value={tp}>{tp}</option>
          ))}
        </select>
        <select
          value={publicFilter}
          onChange={(e) => { setPublicFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-card/50 text-foreground focus:outline-none focus:border-primary text-sm"
        >
          <option value="">{t("readings.allVisibility")}</option>
          <option value="true">{t("readings.public")}</option>
          <option value="false">{t("readings.private")}</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left p-3">{t("readings.type")}</th>
              <th className="text-left p-3">{t("readings.user")}</th>
              <th className="text-left p-3">{t("readings.visibility")}</th>
              <th className="text-left p-3">{t("readings.date")}</th>
              <th className="text-left p-3">{t("readings.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">{t("loading")}</td></tr>
            ) : readings.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">{t("readings.noResults")}</td></tr>
            ) : readings.map((r) => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-xs border border-primary/30 bg-primary/10 text-primary">
                    {r.type}
                  </span>
                </td>
                <td className="p-3">
                  <div className="font-medium">{r.userName || "—"}</div>
                  <div className="text-xs text-muted-foreground">{r.userEmail}</div>
                </td>
                <td className="p-3">
                  <span className={`text-xs ${r.isPublic ? "text-green-400" : "text-muted-foreground"}`}>
                    {r.isPublic ? "🌐 " + t("readings.public") : "🔒 " + t("readings.private")}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground text-xs">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => deleteReading(r.id)}
                    className="px-2 py-1 rounded text-xs text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors"
                  >
                    🗑 {t("readings.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("pagination.showing", { from: (page - 1) * 20 + 1, to: Math.min(page * 20, total), total })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-border disabled:opacity-30 hover:bg-muted/50"
            >
              ←
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-border disabled:opacity-30 hover:bg-muted/50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
