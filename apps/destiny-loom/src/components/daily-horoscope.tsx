"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@cyberfaith/ui";

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

const ZODIAC_EMOJIS: Record<string, string> = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};

interface HoroscopeData {
  sign: string;
  date: string;
  mood: string;
  luckyNumber: number;
  compatibility: string;
  reading: string;
}

export function DailyHoroscope({ token }: { token?: string | null }) {
  const t = useTranslations("horoscope");
  const [data, setData] = useState<HoroscopeData | null>(null);
  const [needsSign, setNeedsSign] = useState(false);
  const [selectedSign, setSelectedSign] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "";

  const fetchHoroscope = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${coreApiUrl}/readings/daily-horoscope`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "ZODIAC_SIGN_NOT_SET") {
          setNeedsSign(true);
        } else {
          setError(json.message || "Failed to load horoscope");
        }
        return;
      }
      setData(json.data);
      setNeedsSign(false);
    } catch {
      setError("Failed to load horoscope");
    } finally {
      setLoading(false);
    }
  }, [token, coreApiUrl]);

  useEffect(() => {
    fetchHoroscope();
  }, [fetchHoroscope]);

  const handleSetSign = async () => {
    if (!selectedSign || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${coreApiUrl}/users/zodiac`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ zodiacSign: selectedSign }),
      });
      if (res.ok) {
        setNeedsSign(false);
        await fetchHoroscope();
      }
    } catch {
      setError("Failed to set zodiac sign");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  if (needsSign) {
    return (
      <Card className="border-highlight/30 bg-highlight/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            <h3 className="text-lg font-semibold">{t("setSignTitle")}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{t("setSignDesc")}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {ZODIAC_SIGNS.map((sign) => (
              <button
                key={sign}
                onClick={() => setSelectedSign(sign)}
                className={`text-sm px-2 py-1.5 rounded-md border transition-colors ${
                  selectedSign === sign
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {ZODIAC_EMOJIS[sign]} {t(`signs.${sign}`)}
              </button>
            ))}
          </div>
          {selectedSign && (
            <button
              onClick={handleSetSign}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? t("saving") : t("setSign")}
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-accent/30 animate-pulse">
        <CardContent className="p-6 h-32" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-highlight/5">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{ZODIAC_EMOJIS[data.sign]}</span>
            <div>
              <h3 className="font-semibold">{t("dailyTitle")}</h3>
              <p className="text-xs text-muted-foreground capitalize">
                {t(`signs.${data.sign}`)} — {data.date}
              </p>
            </div>
          </div>
          <span className="text-sm px-2 py-1 rounded-full bg-accent/10 text-accent">
            {data.mood}
          </span>
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed">{data.reading}</p>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-background/50 rounded-md p-2">
            <span className="text-muted-foreground">{t("luckyNumber")}</span>
            <p className="font-semibold text-lg">{data.luckyNumber}</p>
          </div>
          <div className="bg-background/50 rounded-md p-2">
            <span className="text-muted-foreground">{t("compatibility")}</span>
            <p className="font-semibold capitalize">
              {ZODIAC_EMOJIS[data.compatibility]} {t(`signs.${data.compatibility}`)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
