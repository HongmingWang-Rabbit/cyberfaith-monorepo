"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { useMuyuSound } from "@/components/arcade/games/muyu/use-muyu-sound";

const MuyuFish = dynamic(() => import("@/components/arcade/games/muyu/muyu-fish").then(m => m.MuyuFish), { ssr: false });
const MuyuStats = dynamic(() => import("@/components/arcade/games/muyu/muyu-stats").then(m => m.MuyuStats), { ssr: false });
const MuyuSkinPicker = dynamic(() => import("@/components/arcade/games/muyu/muyu-skin-picker").then(m => m.MuyuSkinPicker), { ssr: false });
import type { MuyuSkin } from "@/components/arcade/games/muyu/skins";

const T = {
  en: {
    back: "← Back to Arcade",
    autoOn: "Auto ●",
    autoOff: "Auto",
    allTime: "Total",
    signIn: "Sign in to save progress",
  },
  zh: {
    back: "← 返回",
    autoOn: "自动 ●",
    autoOff: "自动",
    allTime: "累计",
    signIn: "登录以保存进度",
  },
} as const;

export default function MuyuPage() {
  const locale = useLocale();
  const t = T[locale as keyof typeof T] || T.en;
  const playTok = useMuyuSound();

  const [sessionTaps, setSessionTaps] = useState(0);
  const [allTimeTaps, setAllTimeTaps] = useState(0);
  const [activeSkin, setActiveSkin] = useState<MuyuSkin>("classic");
  const [autoMode, setAutoMode] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number }[]>([]);
  const [isTapping, setIsTapping] = useState(false);

  const pendingTaps = useRef(0);
  const batchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatId = useRef(0);
  const autoInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAuthed = useRef(false);

  // Load stats
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    isAuthed.current = true;

    fetch("/api/arcade/muyu/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAllTimeTaps(d.data.totalTaps);
      })
      .catch(() => {});
  }, []);

  // Batch send
  const flushTaps = useCallback(() => {
    if (pendingTaps.current <= 0) return;
    const count = pendingTaps.current;
    pendingTaps.current = 0;

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/arcade/muyu/tap", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tapCount: count }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAllTimeTaps(d.data.totalTaps);
      })
      .catch(() => {});
  }, []);

  const handleTap = useCallback(
    (e?: React.MouseEvent | React.TouchEvent) => {
      if (e) e.preventDefault();

      playTok();

      setSessionTaps((p) => p + 1);
      setAllTimeTaps((p) => p + 1);

      // Floating 功德+1
      const fid = ++floatId.current;
      setFloatingTexts((prev) => [...prev.slice(-8), { id: fid }]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((f) => f.id !== fid));
      }, 1400);

      // Tap bounce
      setIsTapping(true);
      setTimeout(() => setIsTapping(false), 80);

      // Batch
      pendingTaps.current++;
      if (batchTimer.current) clearTimeout(batchTimer.current);
      if (pendingTaps.current >= 10) {
        flushTaps();
      } else {
        batchTimer.current = setTimeout(flushTaps, 2000);
      }
    },
    [playTok, flushTaps],
  );

  // Auto mode
  useEffect(() => {
    if (autoMode) {
      autoInterval.current = setInterval(() => handleTap(), 1000);
    } else if (autoInterval.current) {
      clearInterval(autoInterval.current);
    }
    return () => {
      if (autoInterval.current) clearInterval(autoInterval.current);
    };
  }, [autoMode, handleTap]);

  // Flush on unmount
  useEffect(() => {
    return () => { flushTaps(); };
  }, [flushTaps]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-6 px-4 select-none"
      style={{ background: "#1a1a1a" }}
    >
      {/* Top: back link */}
      <div className="w-full max-w-sm">
        <Link
          href="/arcade"
          className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          {t.back}
        </Link>
      </div>

      {/* Center: counter + fish */}
      <div className="flex flex-col items-center">
        {/* Merit counter */}
        <MuyuStats
          sessionTaps={sessionTaps}
          allTimeTaps={allTimeTaps}
          t={t}
        />

        {/* Fish with floating text */}
        <div className="relative mt-6 mb-4" style={{ width: 220, height: 240 }}>
          {/* Floating 功德+1 */}
          {floatingTexts.map((ft) => (
            <div
              key={ft.id}
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none font-serif animate-merit-float"
              style={{
                top: "20%",
                color: "rgba(218, 165, 32, 0.9)",
                fontSize: "18px",
              }}
            >
              功德+1
            </div>
          ))}

          {/* The fish */}
          <MuyuFish
            skin={activeSkin}
            isTapping={isTapping}
            onTap={handleTap}
          />
        </div>
      </div>

      {/* Bottom: auto toggle + skins */}
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <button
          onClick={() => setAutoMode((p) => !p)}
          className={`text-xs px-4 py-1.5 rounded-full border transition-colors ${
            autoMode
              ? "border-amber-700/50 text-amber-400/80 bg-amber-900/20"
              : "border-neutral-700 text-neutral-500 hover:text-neutral-400"
          }`}
        >
          {autoMode ? t.autoOn : t.autoOff}
        </button>

        <MuyuSkinPicker
          activeSkin={activeSkin}
          onSkinChange={setActiveSkin}
          totalMerit={allTimeTaps}
        />

        {!isAuthed.current && (
          <p className="text-neutral-600 text-xs">{t.signIn}</p>
        )}
      </div>

      <style jsx global>{`
        @keyframes merit-float {
          0% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -60px); }
        }
        .animate-merit-float {
          animation: merit-float 1.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
