"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { SvgLineChart, SvgBarChart, SvgRetentionHeatmap, SvgFunnel } from "./svg-charts";

function getToken(): string | null {
  try {
    const stored = localStorage.getItem("cyberfaith_auth");
    if (!stored) return null;
    return JSON.parse(stored).tokens.accessToken;
  } catch { return null; }
}

interface AnalyticsData {
  userGrowth: { day: string; signups: number }[];
  activeUsers: { dau: number; wau: number; mau: number };
  readingVolume: { day: string; type: string; volume: number }[];
  revenue: { mrr: number; totalSubscribers: number; churnedUsers: number };
  topReadings: { id: string; type: string; user_name: string; reaction_count: number; comment_count: number; engagement: number }[];
  conversionFunnel: { totalSignups: number; firstReading: number; secondReading: number; subscribed: number };
  retention: { signup_date: string; cohort_size: number; day1: number; day7: number; day30: number }[];
}

export function AdminAnalyticsTab() {
  const t = useTranslations("admin");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    if (!token) return;
    try {
      const params = new URLSearchParams({ from: fromDate, to: toDate });
      const res = await fetch(`/api/admin/analytics?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.data) setData(json.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [fromDate, toDate]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) return <div className="text-primary animate-pulse py-8 text-center">{t("loading")}</div>;
  if (!data) return <div className="text-muted-foreground py-8 text-center">Failed to load analytics</div>;

  // Aggregate reading volume by day
  const volumeByDay = new Map<string, number>();
  for (const r of data.readingVolume) {
    volumeByDay.set(r.day, (volumeByDay.get(r.day) || 0) + r.volume);
  }

  // Aggregate reading volume by type
  const volumeByType = new Map<string, number>();
  for (const r of data.readingVolume) {
    volumeByType.set(r.type, (volumeByType.get(r.type) || 0) + r.volume);
  }

  const typeColors: Record<string, string> = {
    tarot: "#8b5cf6", mbti: "#06b6d4", "i-ching": "#10b981",
    "four-pillars": "#f59e0b", zodiac: "#ef4444",
  };

  return (
    <div className="space-y-6">
      {/* Date range picker */}
      <div className="flex gap-3 items-center flex-wrap">
        <label className="text-sm text-muted-foreground">{t("analytics.from")}:</label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border bg-card/50 text-foreground text-sm focus:outline-none focus:border-primary" />
        <label className="text-sm text-muted-foreground">{t("analytics.to")}:</label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border bg-card/50 text-foreground text-sm focus:outline-none focus:border-primary" />
      </div>

      {/* Active users cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/50">
          <div className="text-sm text-muted-foreground">DAU</div>
          <div className="text-2xl font-bold text-primary">{data.activeUsers.dau}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/50">
          <div className="text-sm text-muted-foreground">WAU</div>
          <div className="text-2xl font-bold text-cyan-400">{data.activeUsers.wau}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/50">
          <div className="text-sm text-muted-foreground">MAU</div>
          <div className="text-2xl font-bold text-emerald-400">{data.activeUsers.mau}</div>
        </div>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/50">
          <div className="text-sm text-muted-foreground">{t("analytics.mrr")}</div>
          <div className="text-2xl font-bold text-amber-400">${data.revenue.mrr.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/50">
          <div className="text-sm text-muted-foreground">{t("analytics.subscribers")}</div>
          <div className="text-2xl font-bold">{data.revenue.totalSubscribers}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/50">
          <div className="text-sm text-muted-foreground">{t("analytics.churned")}</div>
          <div className="text-2xl font-bold text-red-400">{data.revenue.churnedUsers}</div>
        </div>
      </div>

      {/* User growth line chart */}
      <div className="p-5 rounded-xl border border-border bg-card/50">
        <SvgLineChart
          title={t("analytics.userGrowth")}
          data={data.userGrowth.map((d) => ({ label: d.day?.slice(5, 10) || "", value: d.signups }))}
          color="#8b5cf6"
        />
      </div>

      {/* Reading volume bar chart */}
      <div className="p-5 rounded-xl border border-border bg-card/50">
        <SvgBarChart
          title={t("analytics.readingVolume")}
          data={Array.from(volumeByType.entries()).map(([type, vol]) => ({
            label: type,
            value: vol,
            color: typeColors[type] || "#8b5cf6",
          }))}
        />
      </div>

      {/* Conversion funnel */}
      <div className="p-5 rounded-xl border border-border bg-card/50">
        <SvgFunnel
          title={t("analytics.conversionFunnel")}
          steps={[
            { label: t("analytics.funnelSignup"), value: data.conversionFunnel.totalSignups },
            { label: t("analytics.funnelFirstReading"), value: data.conversionFunnel.firstReading },
            { label: t("analytics.funnelSecondReading"), value: data.conversionFunnel.secondReading },
            { label: t("analytics.funnelSubscribed"), value: data.conversionFunnel.subscribed },
          ]}
        />
      </div>

      {/* Retention heatmap */}
      <div className="p-5 rounded-xl border border-border bg-card/50">
        <SvgRetentionHeatmap
          title={t("analytics.retention")}
          data={data.retention.map((r) => ({
            label: typeof r.signup_date === "string" ? r.signup_date.slice(5, 10) : "",
            day1: r.day1,
            day7: r.day7,
            day30: r.day30,
            cohortSize: r.cohort_size,
          }))}
        />
      </div>

      {/* Top readings */}
      <div className="p-5 rounded-xl border border-border bg-card/50">
        <div className="text-sm font-medium text-muted-foreground mb-3">{t("analytics.topReadings")}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left p-2">{t("readings.type")}</th>
                <th className="text-left p-2">{t("readings.user")}</th>
                <th className="text-right p-2">Reactions</th>
                <th className="text-right p-2">Comments</th>
                <th className="text-right p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.topReadings.slice(0, 10).map((r) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="p-2"><span className="px-2 py-0.5 rounded-full text-xs border border-primary/30 bg-primary/10">{r.type}</span></td>
                  <td className="p-2 text-muted-foreground">{r.user_name || "—"}</td>
                  <td className="p-2 text-right font-mono">{r.reaction_count}</td>
                  <td className="p-2 text-right font-mono">{r.comment_count}</td>
                  <td className="p-2 text-right font-mono font-bold">{r.engagement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
