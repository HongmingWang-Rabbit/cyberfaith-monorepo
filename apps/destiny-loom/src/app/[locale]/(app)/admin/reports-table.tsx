"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Report {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporterName: string;
  reporterEmail: string;
}

export function AdminReportsTable() {
  const t = useTranslations("admin.reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  const getToken = () => {
    try {
      const stored = localStorage.getItem("cyberfaith_auth");
      if (!stored) return null;
      return JSON.parse(stored).tokens?.accessToken;
    } catch { return null; }
  };

  const loadReports = async (status?: string) => {
    setLoading(true);
    const token = getToken();
    if (!token) return;
    try {
      const url = status ? `/api/admin/reports?status=${status}` : "/api/admin/reports";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setReports(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(filter || undefined);
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) loadReports(filter || undefined);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    reviewed: "bg-green-500/20 text-green-400",
    dismissed: "bg-gray-500/20 text-gray-400",
  };

  const filters = [
    { key: "", label: t("filterAll") },
    { key: "pending", label: t("filterPending") },
    { key: "reviewed", label: t("filterReviewed") },
    { key: "dismissed", label: t("filterDismissed") },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">🚩 {t("title")}</h2>

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === f.key
                ? "bg-primary text-white"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/10 text-muted-foreground text-left">
                <th className="pb-2 pr-3">{t("status")}</th>
                <th className="pb-2 pr-3">{t("targetType")}</th>
                <th className="pb-2 pr-3">{t("reason")}</th>
                <th className="pb-2 pr-3">{t("reporter")}</th>
                <th className="pb-2 pr-3">{t("details")}</th>
                <th className="pb-2 pr-3">{t("createdAt")}</th>
                <th className="pb-2">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-primary/5">
                  <td className="py-2 pr-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[r.status] || ""}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{r.targetType}</td>
                  <td className="py-2 pr-3 text-foreground">{r.reason}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{r.reporterName}</td>
                  <td className="py-2 pr-3 text-muted-foreground max-w-[200px] truncate">{r.details || "—"}</td>
                  <td className="py-2 pr-3 text-muted-foreground text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    {r.status === "pending" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateStatus(r.id, "reviewed")}
                          className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        >
                          {t("markReviewed")}
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, "dismissed")}
                          className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                        >
                          {t("dismiss")}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
