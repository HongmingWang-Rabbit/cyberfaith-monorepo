"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { AdminUsersTable } from "./users-table";
import { AdminReadingsTable } from "./readings-table";
import { AdminReportsTable } from "./reports-table";
import { AdminAnalyticsTab } from "./analytics-tab";
import { AdminEventsTab } from "./events-tab";
import { AdminNotificationsTab } from "./notifications-tab";
import { AdminAuditLogTab } from "./audit-log-tab";

type TabKey = "overview" | "users" | "readings" | "analytics" | "reports" | "events" | "notifications" | "metrics" | "audit";

interface Stats {
  totalUsers: number;
  totalReadings: number;
  readingsToday: number;
  activeSubscriptions: number;
  estimatedMonthlyRevenue: number;
}

interface Metrics {
  requestsLastHour: number;
  requestsLastDay: number;
  totalRequests: number;
  errorCount: number;
  errorRate: string;
  averageResponseMs: number;
  activeUsers24h: number;
  dbQueryCount: number;
  cacheHitRate: string;
  cacheHits: number;
  cacheMisses: number;
}

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !(user as any)?.role || (user as any)?.role !== "admin")) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const stored = localStorage.getItem("cyberfaith_auth");
        if (!stored) return;
        const { tokens } = JSON.parse(stored);
        const [statsRes, metricsRes] = await Promise.all([
          fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${tokens.accessToken}` } }),
          fetch("/api/admin/metrics", { headers: { Authorization: `Bearer ${tokens.accessToken}` } }),
        ]);
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.data);
        }
        if (metricsRes.ok) {
          const data = await metricsRes.json();
          setMetrics(data.data);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (isAuthenticated) fetchStats();
  }, [isAuthenticated]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-primary animate-pulse text-xl">⚡ {t("loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: t("tabs.overview"), icon: "📊" },
    { key: "users", label: t("tabs.users"), icon: "👥" },
    { key: "readings", label: t("tabs.readings"), icon: "🔮" },
    { key: "analytics", label: t("tabs.analytics"), icon: "📈" },
    { key: "reports", label: t("tabs.reports"), icon: "🚩" },
    { key: "events", label: t("tabs.events"), icon: "🎉" },
    { key: "notifications", label: t("tabs.notifications"), icon: "📣" },
    { key: "metrics", label: t("tabs.metrics"), icon: "⚡" },
    { key: "audit", label: t("tabs.audit"), icon: "📋" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">⚡</span>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-border pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-primary/15 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="👥" label={t("stats.totalUsers")} value={stats.totalUsers} color="from-violet-500 to-purple-600" />
            <StatCard icon="🔮" label={t("stats.totalReadings")} value={stats.totalReadings} color="from-cyan-500 to-blue-600" />
            <StatCard icon="📅" label={t("stats.readingsToday")} value={stats.readingsToday} color="from-emerald-500 to-green-600" />
            <StatCard icon="💎" label={t("stats.activeSubs")} value={stats.activeSubscriptions} color="from-amber-500 to-orange-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4">💰 {t("stats.revenue")}</h3>
              <div className="text-3xl font-bold text-primary">
                ${stats.estimatedMonthlyRevenue.toFixed(2)}
                <span className="text-sm text-muted-foreground font-normal ml-2">{t("stats.perMonth")}</span>
              </div>
              <div className="mt-6 flex items-end gap-2 h-32">
                <BarChart value={stats.activeSubscriptions} max={stats.totalUsers} label={t("stats.proUsers")} color="bg-primary" />
                <BarChart value={stats.totalUsers - stats.activeSubscriptions} max={stats.totalUsers} label={t("stats.freeUsers")} color="bg-muted-foreground" />
                <BarChart value={stats.readingsToday} max={Math.max(stats.totalReadings / 30, 1)} label={t("stats.todayActivity")} color="bg-accent" />
              </div>
            </div>

            {metrics && (
              <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm space-y-4">
                <h3 className="text-lg font-semibold">⚡ {t("tabs.metrics")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat label="Requests/hr" value={String(metrics.requestsLastHour)} />
                  <MiniStat label="Avg Response" value={`${metrics.averageResponseMs}ms`} />
                  <MiniStat label="Error Rate" value={metrics.errorRate} />
                  <MiniStat label="Cache Hit" value={metrics.cacheHitRate} />
                  <MiniStat label="Active 24h" value={String(metrics.activeUsers24h)} />
                  <MiniStat label="DB Queries" value={metrics.dbQueryCount.toLocaleString()} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics tab */}
      {activeTab === "metrics" && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="📨" label="Requests (last hour)" value={metrics.requestsLastHour} color="from-blue-500 to-cyan-600" />
            <StatCard icon="📊" label="Requests (last day)" value={metrics.requestsLastDay} color="from-violet-500 to-purple-600" />
            <StatCard icon="⚡" label="Avg Response (ms)" value={metrics.averageResponseMs} color="from-emerald-500 to-green-600" />
            <StatCard icon="👤" label="Active Users (24h)" value={metrics.activeUsers24h} color="from-amber-500 to-orange-600" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="text-sm text-muted-foreground mb-1">Error Rate</div>
              <div className="text-2xl font-bold text-red-400">{metrics.errorRate}</div>
              <div className="text-xs text-muted-foreground mt-1">{metrics.errorCount} errors / {metrics.totalRequests} total</div>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="text-sm text-muted-foreground mb-1">Cache Hit Rate</div>
              <div className="text-2xl font-bold text-primary">{metrics.cacheHitRate}</div>
              <div className="text-xs text-muted-foreground mt-1">{metrics.cacheHits} hits / {metrics.cacheMisses} misses</div>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="text-sm text-muted-foreground mb-1">DB Queries</div>
              <div className="text-2xl font-bold">{metrics.dbQueryCount.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && <AdminUsersTable />}
      {activeTab === "readings" && <AdminReadingsTable />}
      {activeTab === "analytics" && <AdminAnalyticsTab />}
      {activeTab === "reports" && <AdminReportsTable />}
      {activeTab === "events" && <AdminEventsTab />}
      {activeTab === "notifications" && <AdminNotificationsTab />}
      {activeTab === "audit" && <AdminAuditLogTab />}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
      <div className="relative">
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg border border-border/50 bg-muted/10">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function BarChart({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <div className="text-xs font-mono text-muted-foreground">{value}</div>
      <div className="w-full bg-muted/30 rounded-t-sm relative" style={{ height: "100px" }}>
        <div
          className={`${color} rounded-t-sm absolute bottom-0 w-full transition-all duration-500`}
          style={{ height: `${pct}%`, minHeight: pct > 0 ? "4px" : "0" }}
        />
      </div>
      <div className="text-[10px] text-muted-foreground text-center leading-tight">{label}</div>
    </div>
  );
}
