"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";

function getToken(): string | null {
  try {
    const stored = localStorage.getItem("cyberfaith_auth");
    if (!stored) return null;
    return JSON.parse(stored).tokens.accessToken;
  } catch { return null; }
}

interface AuditEntry {
  id: string;
  adminUserId: string;
  adminName: string | null;
  adminEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: any;
  createdAt: string;
}

export function AdminAuditLogTab() {
  const t = useTranslations("admin");
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLog = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    if (!token) return;
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    const res = await fetch(`/api/admin/audit-log?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    setEntries(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  const totalPages = Math.ceil(total / 30);

  const actionColors: Record<string, string> = {
    ban_user: "text-red-400 bg-red-400/10 border-red-400/30",
    unban_user: "text-green-400 bg-green-400/10 border-green-400/30",
    update_user: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    delete_reading: "text-red-400 bg-red-400/10 border-red-400/30",
    hide_reading: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    unhide_reading: "text-green-400 bg-green-400/10 border-green-400/30",
    rotate_jwt_secret: "text-purple-400 bg-purple-400/10 border-purple-400/30",
    send_push: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">📋 {t("auditLog.title")}</h3>

      <div className="overflow-x-auto rounded-xl border border-border bg-card/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left p-3">{t("auditLog.time")}</th>
              <th className="text-left p-3">{t("auditLog.admin")}</th>
              <th className="text-left p-3">{t("auditLog.action")}</th>
              <th className="text-left p-3">{t("auditLog.target")}</th>
              <th className="text-left p-3">{t("auditLog.details")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">{t("loading")}</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">{t("auditLog.empty")}</td></tr>
            ) : entries.map((e) => (
              <tr key={e.id} className="border-b border-border/50 hover:bg-muted/20">
                <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(e.createdAt).toLocaleString()}
                </td>
                <td className="p-3 text-xs">{e.adminName || e.adminEmail || e.adminUserId.slice(0, 8)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${actionColors[e.action] || "text-muted-foreground bg-muted/10 border-border"}`}>
                    {e.action}
                  </span>
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {e.targetType && <>{e.targetType}: {e.targetId?.slice(0, 8)}...</>}
                </td>
                <td className="p-3 text-xs text-muted-foreground font-mono max-w-48 truncate">
                  {e.details ? JSON.stringify(e.details) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("pagination.showing", { from: (page - 1) * 30 + 1, to: Math.min(page * 30, total), total })}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-3 py-1 rounded border border-border disabled:opacity-30 hover:bg-muted/50">←</button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-3 py-1 rounded border border-border disabled:opacity-30 hover:bg-muted/50">→</button>
          </div>
        </div>
      )}
    </div>
  );
}
