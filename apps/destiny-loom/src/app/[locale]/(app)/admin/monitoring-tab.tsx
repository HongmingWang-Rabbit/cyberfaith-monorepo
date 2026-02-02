"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";

interface MonitoringData {
  system: {
    status: string;
    uptime: number;
    uptimeFormatted: string;
    version: string;
    nodeVersion: string;
    platform: string;
    timestamp: string;
  };
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    externalMB: number;
    arrayBuffersMB: number;
  };
  cpu: { userMs: number; systemMs: number };
  database: { connected: boolean; latencyMs?: number };
  redis: { connected: boolean; activeSessions: number };
  requests: {
    totalRequests: number;
    requestsLastHour: number;
    requestsLastDay: number;
    averageResponseMs: number;
    errorCount: number;
    errorRate: string;
  };
  cache: { hitRate: string; hits: number; misses: number; size: number };
  users: { activeUsers24h: number };
}

export function AdminMonitoringTab() {
  const t = useTranslations("admin.monitoring");
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const stored = localStorage.getItem("cyberfaith_auth");
      if (!stored) return;
      const { tokens } = JSON.parse(stored);
      const res = await fetch("/api/admin/monitoring", {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        setError("");
      } else {
        setError("Failed to fetch monitoring data");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <div className="text-center py-12 text-muted-foreground animate-pulse">⏳ {t("loading")}</div>;
  if (error) return <div className="text-center py-12 text-red-400">{error}</div>;
  if (!data) return null;

  const statusColor = data.system.status === "ok" ? "text-emerald-400" : "text-red-400";
  const memPct = data.memory.heapTotalMB > 0 ? ((data.memory.heapUsedMB / data.memory.heapTotalMB) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard icon="🟢" label={t("status")} value={<span className={statusColor}>{data.system.status.toUpperCase()}</span>} sub={t("uptime", { time: data.system.uptimeFormatted })} />
        <StatusCard icon="🧠" label={t("memory")} value={`${data.memory.heapUsedMB} MB`} sub={`${memPct}% ${t("of")} ${data.memory.heapTotalMB} MB`} />
        <StatusCard icon="⚡" label={t("responseTime")} value={`${data.requests.averageResponseMs}ms`} sub={`${data.requests.requestsLastHour} ${t("reqHour")}`} />
        <StatusCard icon="❌" label={t("errorRate")} value={data.requests.errorRate} sub={`${data.requests.errorCount} ${t("errors")}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm space-y-4">
          <h3 className="text-lg font-semibold">🗄️ {t("infrastructure")}</h3>
          <div className="space-y-3">
            <InfraRow label={t("database")} connected={data.database.connected} detail={data.database.latencyMs != null ? `${data.database.latencyMs}ms` : undefined} />
            <InfraRow label="Redis" connected={data.redis.connected} detail={`${data.redis.activeSessions} ${t("sessions")}`} />
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm space-y-4">
          <h3 className="text-lg font-semibold">💾 {t("cache")}</h3>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label={t("hitRate")} value={data.cache.hitRate} />
            <MiniStat label={t("cacheSize")} value={String(data.cache.size)} />
            <MiniStat label={t("cacheHits")} value={data.cache.hits.toLocaleString()} />
            <MiniStat label={t("cacheMisses")} value={data.cache.misses.toLocaleString()} />
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">📊 {t("memoryBreakdown")}</h3>
        <div className="space-y-3">
          <MemBar label="Heap Used" value={data.memory.heapUsedMB} max={data.memory.rssMB} color="bg-primary" />
          <MemBar label="Heap Total" value={data.memory.heapTotalMB} max={data.memory.rssMB} color="bg-primary/60" />
          <MemBar label="RSS" value={data.memory.rssMB} max={data.memory.rssMB} color="bg-accent" />
          <MemBar label="External" value={data.memory.externalMB} max={data.memory.rssMB} color="bg-muted-foreground" />
        </div>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">📨 {t("requestStats")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label={t("totalRequests")} value={data.requests.totalRequests.toLocaleString()} />
          <MiniStat label={t("reqHour")} value={String(data.requests.requestsLastHour)} />
          <MiniStat label={t("reqDay")} value={String(data.requests.requestsLastDay)} />
          <MiniStat label={t("activeUsers")} value={String(data.users.activeUsers24h)} />
        </div>
      </div>

      <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
        <span>v{data.system.version}</span>
        <span>Node {data.system.nodeVersion}</span>
        <span>{data.system.platform}</span>
        <span>CPU: {data.cpu.userMs}ms user / {data.cpu.systemMs}ms sys</span>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, sub }: { icon: string; label: string; value: React.ReactNode; sub: string }) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function InfraRow({ label, connected, detail }: { label: string; connected: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/10">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
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

function MemBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value} MB</span>
      </div>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
