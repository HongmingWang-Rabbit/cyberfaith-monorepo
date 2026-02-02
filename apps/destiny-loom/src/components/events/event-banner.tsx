"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

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
}

export function EventBanner() {
  const t = useTranslations("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/events/active`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => setEvents(json?.data ?? []))
      .catch(() => {});
  }, []);

  if (events.length === 0 || dismissed) return null;

  const event = events[0];

  return (
    <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 via-primary/10 to-highlight/10 p-4 mb-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-sm"
      >
        ✕
      </button>
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎉</span>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{event.name}</h3>
          {event.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
          )}
          {event.karmaMultiplier > 1 && (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-semibold">
              ⚡ {event.karmaMultiplier}x {t("karmaMultiplier")}
            </span>
          )}
        </div>
        <Link href="/events" className="text-xs px-3 py-1.5 rounded-lg bg-primary/20 text-primary font-medium hover:bg-primary/30 transition">
          {t("viewDetails")}
        </Link>
      </div>
    </div>
  );
}

export function EventBadge({ karmaMultiplier }: { karmaMultiplier?: number }) {
  if (!karmaMultiplier || karmaMultiplier <= 1) return null;
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-semibold">
      ⚡ {karmaMultiplier}x
    </span>
  );
}
