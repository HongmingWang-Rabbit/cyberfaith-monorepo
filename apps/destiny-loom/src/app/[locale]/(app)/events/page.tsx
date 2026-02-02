"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Event {
  id: string;
  name: string;
  description: string | null;
  type: string;
  startDate: string;
  endDate: string;
  bannerImageUrl: string | null;
  karmaMultiplier: number;
  active: boolean;
}

const typeEmoji: Record<string, string> = {
  seasonal: "🌸",
  holiday: "🎊",
  astronomical: "🌙",
};

export default function EventsPage() {
  const t = useTranslations("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => setEvents(json?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const active = events.filter((e) => new Date(e.endDate) >= now && new Date(e.startDate) <= now);
  const past = events.filter((e) => new Date(e.endDate) < now);
  const upcoming = events.filter((e) => new Date(e.startDate) > now);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
          🎉 {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{t("loading")}</div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-accent">{t("activeEvents")}</h2>
              {active.map((e) => <EventCard key={e.id} event={e} isActive t={t} />)}
            </section>
          )}
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">{t("upcomingEvents")}</h2>
              {upcoming.map((e) => <EventCard key={e.id} event={e} t={t} />)}
            </section>
          )}
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">{t("pastEvents")}</h2>
              {past.map((e) => <EventCard key={e.id} event={e} isPast t={t} />)}
            </section>
          )}
          {events.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">{t("noEvents")}</div>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event, isActive, isPast, t }: { event: Event; isActive?: boolean; isPast?: boolean; t: any }) {
  return (
    <div className={`rounded-xl border p-5 ${
      isActive ? "border-accent/30 bg-accent/5 shadow-[0_0_20px_rgba(0,255,255,0.1)]" : isPast ? "border-border/30 bg-card/40 opacity-70" : "border-primary/20 bg-card/60"
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{typeEmoji[event.type] || "🎉"}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{event.name}</h3>
            {isActive && (
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                {t("live")}
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{new Date(event.startDate).toLocaleDateString()} — {new Date(event.endDate).toLocaleDateString()}</span>
            {event.karmaMultiplier > 1 && (
              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
                ⚡ {event.karmaMultiplier}x karma
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
