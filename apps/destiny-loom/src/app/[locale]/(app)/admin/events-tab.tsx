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

interface Event {
  id: string;
  name: string;
  description: string | null;
  type: string;
  startDate: string;
  endDate: string;
  active: boolean;
  karmaMultiplier: number;
  specialReadingType: string | null;
}

export function AdminEventsTab() {
  const t = useTranslations("admin");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", type: "seasonal" as string,
    startDate: "", endDate: "", karmaMultiplier: 1, specialReadingType: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    if (!token) return;
    const res = await fetch("/api/admin/events", { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    setEvents(json.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const createEvent = async () => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    await fetch("/api/admin/events", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        karmaMultiplier: Number(form.karmaMultiplier) || 1,
        specialReadingType: form.specialReadingType || undefined,
        description: form.description || undefined,
      }),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", description: "", type: "seasonal", startDate: "", endDate: "", karmaMultiplier: 1, specialReadingType: "" });
    fetchEvents();
  };

  if (loading) return <div className="text-primary animate-pulse py-8 text-center">{t("loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">🎉 {t("events.title")}</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90">
          {showForm ? t("events.cancel") : t("events.create")}
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
          <input placeholder={t("events.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card/50 text-sm" />
          <textarea placeholder={t("events.description")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card/50 text-sm" rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="px-3 py-2 rounded-lg border border-border bg-card/50 text-sm">
              <option value="seasonal">Seasonal</option>
              <option value="holiday">Holiday</option>
              <option value="astronomical">Astronomical</option>
            </select>
            <input type="number" placeholder="Karma ×" value={form.karmaMultiplier}
              onChange={(e) => setForm({ ...form, karmaMultiplier: parseInt(e.target.value) || 1 })}
              className="px-3 py-2 rounded-lg border border-border bg-card/50 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="px-3 py-2 rounded-lg border border-border bg-card/50 text-sm" />
            <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="px-3 py-2 rounded-lg border border-border bg-card/50 text-sm" />
          </div>
          <button onClick={createEvent} disabled={saving || !form.name || !form.startDate || !form.endDate}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-50">
            {saving ? t("loading") : t("events.save")}
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left p-3">{t("events.name")}</th>
              <th className="text-left p-3">{t("events.type")}</th>
              <th className="text-left p-3">{t("events.start")}</th>
              <th className="text-left p-3">{t("events.end")}</th>
              <th className="text-right p-3">Karma ×</th>
              <th className="text-left p-3">{t("events.status")}</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">{t("events.empty")}</td></tr>
            ) : events.map((ev) => {
              const now = new Date();
              const isActive = ev.active && new Date(ev.startDate) <= now && new Date(ev.endDate) >= now;
              return (
                <tr key={ev.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="p-3 font-medium">{ev.name}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs border border-primary/30 bg-primary/10">{ev.type}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(ev.startDate).toLocaleDateString()}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(ev.endDate).toLocaleDateString()}</td>
                  <td className="p-3 text-right font-mono">{ev.karmaMultiplier}×</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 text-xs ${isActive ? "text-green-400" : "text-muted-foreground"}`}>
                      <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400" : "bg-muted-foreground"}`} />
                      {isActive ? t("events.active") : t("events.inactive")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
