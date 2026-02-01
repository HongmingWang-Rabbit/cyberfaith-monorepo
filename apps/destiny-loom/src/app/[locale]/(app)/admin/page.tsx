"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { AdminUsersTable } from "./users-table";
import { AdminReadingsTable } from "./readings-table";

interface Stats {
  totalUsers: number;
  totalReadings: number;
  readingsToday: number;
  activeSubscriptions: number;
  estimatedMonthlyRevenue: number;
}

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "readings">("dashboard");

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
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data.data);
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

  const tabs = [
    { key: "dashboard" as const, label: t("tabs.dashboard"), icon: "📊" },
    { key: "users" as const, label: t("tabs.users"), icon: "👥" },
    { key: "readings" as const, label: t("tabs.readings"), icon: "🔮" },
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
      <div className="flex gap-2 border-b border-border pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-primary/15 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard tab */}
      {activeTab === "dashboard" && stats && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="👥"
              label={t("stats.totalUsers")}
              value={stats.totalUsers}
              color="from-violet-500 to-purple-600"
            />
            <StatCard
              icon="🔮"
              label={t("stats.totalReadings")}
              value={stats.totalReadings}
              color="from-cyan-500 to-blue-600"
            />
            <StatCard
              icon="📅"
              label={t("stats.readingsToday")}
              value={stats.readingsToday}
              color="from-emerald-500 to-green-600"
            />
            <StatCard
              icon="💎"
              label={t("stats.activeSubs")}
              value={stats.activeSubscriptions}
              color="from-amber-500 to-orange-600"
            />
          </div>

          {/* Revenue card */}
          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4">💰 {t("stats.revenue")}</h3>
            <div className="text-3xl font-bold text-primary">
              ${stats.estimatedMonthlyRevenue.toFixed(2)}
              <span className="text-sm text-muted-foreground font-normal ml-2">{t("stats.perMonth")}</span>
            </div>
            {/* Simple bar chart */}
            <div className="mt-6 flex items-end gap-2 h-32">
              <BarChart value={stats.activeSubscriptions} max={stats.totalUsers} label={t("stats.proUsers")} color="bg-primary" />
              <BarChart value={stats.totalUsers - stats.activeSubscriptions} max={stats.totalUsers} label={t("stats.freeUsers")} color="bg-muted-foreground" />
              <BarChart value={stats.readingsToday} max={Math.max(stats.totalReadings / 30, 1)} label={t("stats.todayActivity")} color="bg-accent" />
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {activeTab === "users" && <AdminUsersTable />}

      {/* Readings tab */}
      {activeTab === "readings" && <AdminReadingsTable />}
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
