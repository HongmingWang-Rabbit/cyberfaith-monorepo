"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { MuyuFish } from "@/components/arcade/games/muyu/muyu-fish";
import { MuyuStats } from "@/components/arcade/games/muyu/muyu-stats";
import { MuyuSkinPicker } from "@/components/arcade/games/muyu/muyu-skin-picker";
import { useMuyuSound } from "@/components/arcade/games/muyu/use-muyu-sound";
import type { MuyuSkin } from "@/components/arcade/games/muyu/skins";

const T = {
  en: {
    title: "🪷 Wooden Fish",
    subtitle: "Tap to accumulate merit. 功德 +1.",
    back: "← Back to Arcade",
    autoMode: "Auto Mode",
    autoOn: "🤖 Auto ON",
    autoOff: "Auto (10 pts)",
    combo: "combo!",
    merit: "功德",
    session: "Session",
    allTime: "All-Time",
    tps: "Taps/sec",
    streak: "Streak",
    days: "days",
    nextPoint: "Next point at",
    taps: "taps",
    signIn: "Sign in to save progress",
  },
  zh: {
    title: "🪷 电子木鱼",
    subtitle: "敲击积累功德。功德 +1。",
    back: "← 返回街机厅",
    autoMode: "自动模式",
    autoOn: "🤖 自动中",
    autoOff: "自动 (10分)",
    combo: "连击!",
    merit: "功德",
    session: "本次",
    allTime: "累计",
    tps: "每秒",
    streak: "连续",
    days: "天",
    nextPoint: "下次奖励",
    taps: "次",
    signIn: "登录以保存进度",
  },
} as const;

export default function MuyuPage() {
  const locale = useLocale();
  const t = T[locale as keyof typeof T] || T.en;
  const playTok = useMuyuSound();

  // State
  const [sessionTaps, setSessionTaps] = useState(0);
  const [allTimeTaps, setAllTimeTaps] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [nextPointAt, setNextPointAt] = useState(100);
  const [activeSkin, setActiveSkin] = useState<MuyuSkin>("neon-purple");
  const [autoMode, setAutoMode] = useState(false);
  const [combo, setCombo] = useState(0);
  const [tps, setTps] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isTapping, setIsTapping] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; angle: number }[]>([]);

  // Refs for batching
  const pendingTaps = useRef(0);
  const batchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tpsHistory = useRef<number[]>([]);
  const floatId = useRef(0);
  const particleId = useRef(0);
  const autoInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAuthed = useRef(false);

  // Load stats on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    isAuthed.current = true;

    fetch("/api/arcade/muyu/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAllTimeTaps(d.data.totalTaps);
          setStreakDays(d.data.streakDays);
          setNextPointAt(d.data.nextPointAt);
        }
      })
      .catch(() => {});
  }, []);

  // TPS calculator
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      tpsHistory.current = tpsHistory.current.filter((t) => now - t < 1000);
      setTps(tpsHistory.current.length);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Batch send taps
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
        if (d.success) {
          setAllTimeTaps(d.data.totalTaps);
          setNextPointAt(d.data.nextPointAt);
        }
      })
      .catch(() => {});
  }, []);

  const handleTap = useCallback(
    (e?: React.MouseEvent | React.TouchEvent) => {
      // Prevent double-fire from touch + click
      if (e) e.preventDefault();

      playTok();

      setSessionTaps((p) => p + 1);
      setAllTimeTaps((p) => p + 1);
      tpsHistory.current.push(Date.now());

      // Combo
      setCombo((p) => p + 1);
      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboTimer.current = setTimeout(() => setCombo(0), 1500);

      // Floating text
      const fid = ++floatId.current;
      const offsetX = (Math.random() - 0.5) * 80;
      const offsetY = (Math.random() - 0.5) * 30;
      setFloatingTexts((prev) => [...prev.slice(-15), { id: fid, x: offsetX, y: offsetY }]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((f) => f.id !== fid));
      }, 1200);

      // Particles
      for (let i = 0; i < 6; i++) {
        const pid = ++particleId.current;
        const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
        setParticles((prev) => [...prev.slice(-30), { id: pid, x: 0, y: 0, angle }]);
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== pid));
        }, 800);
      }

      // Tap animation
      setIsTapping(true);
      setTimeout(() => setIsTapping(false), 100);

      // Batch API calls
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
    return () => {
      flushTaps();
    };
  }, [flushTaps]);

  const toggleAuto = () => {
    if (!autoMode) {
      // Costs 10 points to activate — deducted server-side in future
      setAutoMode(true);
    } else {
      setAutoMode(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 select-none">
      <div className="max-w-lg mx-auto">
        {/* Back */}
        <Link
          href="/arcade"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors mb-6"
        >
          {t.back}
        </Link>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-gray-400 text-sm">{t.subtitle}</p>
        </div>

        {/* Stats bar */}
        <MuyuStats
          sessionTaps={sessionTaps}
          allTimeTaps={allTimeTaps}
          tps={tps}
          streakDays={streakDays}
          nextPointAt={nextPointAt}
          t={t}
        />

        {/* Wooden Fish */}
        <div className="relative flex items-center justify-center my-8" style={{ minHeight: 300 }}>
          {/* Floating merit texts */}
          {floatingTexts.map((ft) => (
            <div
              key={ft.id}
              className="absolute pointer-events-none text-amber-400 font-bold text-xl animate-float-up"
              style={{
                left: `calc(50% + ${ft.x}px)`,
                top: `calc(50% + ${ft.y}px)`,
                textShadow: "0 0 10px rgba(251, 191, 36, 0.8)",
              }}
            >
              功德 +1
            </div>
          ))}

          {/* Combo */}
          {combo >= 5 && (
            <div className="absolute top-0 right-0 text-cyan-400 font-bold text-lg animate-pulse">
              x{combo} {t.combo}
            </div>
          )}

          {/* Particles */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none w-2 h-2 rounded-full animate-particle-out"
              style={{
                left: "50%",
                top: "50%",
                background: `hsl(${Math.random() * 60 + 270}, 100%, 70%)`,
                ["--angle" as any]: `${p.angle}rad`,
              }}
            />
          ))}

          {/* The Fish */}
          <MuyuFish
            skin={activeSkin}
            isTapping={isTapping}
            onTap={handleTap}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={toggleAuto}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              autoMode
                ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400"
                : "bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600"
            }`}
          >
            {autoMode ? t.autoOn : t.autoOff}
          </button>
        </div>

        {/* Skin picker */}
        <MuyuSkinPicker
          activeSkin={activeSkin}
          onSkinChange={setActiveSkin}
          totalMerit={allTimeTaps}
        />

        {/* Sign in prompt */}
        {!isAuthed.current && (
          <p className="text-center text-gray-500 text-sm mt-4">{t.signIn}</p>
        )}
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-80px); }
        }
        .animate-float-up {
          animation: float-up 1.2s ease-out forwards;
        }
        @keyframes particle-out {
          0% { opacity: 1; transform: translate(-50%, -50%) translateX(0) translateY(0); }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%)
              translateX(calc(cos(var(--angle)) * 80px))
              translateY(calc(sin(var(--angle)) * 80px));
          }
        }
        .animate-particle-out {
          animation: particle-out 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
