"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ArcadeGameProps } from "../types";

type AmbientSound = "silence" | "rain" | "bowls" | "ocean";
type Phase = "inhale" | "hold" | "exhale" | "idle";

const PRESETS = [
  { label: "1 min", labelZh: "1 分钟", seconds: 60 },
  { label: "5 min", labelZh: "5 分钟", seconds: 300 },
  { label: "10 min", labelZh: "10 分钟", seconds: 600 },
  { label: "20 min", labelZh: "20 分钟", seconds: 1200 },
];

const PHASE_DURATIONS: Record<Exclude<Phase, "idle">, number> = {
  inhale: 4000,
  hold: 7000,
  exhale: 8000,
};

const PHASE_LABELS = {
  en: { inhale: "Breathe In", hold: "Hold", exhale: "Breathe Out", idle: "Ready" },
  zh: { inhale: "吸气", hold: "屏住", exhale: "呼气", idle: "准备好了" },
};

function getStreak(): { count: number; lastDate: string } {
  if (typeof window === "undefined") return { count: 0, lastDate: "" };
  try {
    const raw = localStorage.getItem("meditation-streak");
    return raw ? JSON.parse(raw) : { count: 0, lastDate: "" };
  } catch {
    return { count: 0, lastDate: "" };
  }
}

function updateStreak(): number {
  const today = new Date().toISOString().slice(0, 10);
  const streak = getStreak();
  if (streak.lastDate === today) return streak.count;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
  const newStreak = { count: newCount, lastDate: today };
  localStorage.setItem("meditation-streak", JSON.stringify(newStreak));
  return newCount;
}

class AmbientSynth {
  private ctx: AudioContext | null = null;
  private nodes: AudioNode[] = [];
  private playing = false;

  start(sound: AmbientSound) {
    if (sound === "silence" || this.playing) return;
    this.ctx = new AudioContext();
    const ctx = this.ctx;

    if (sound === "rain") {
      // White noise through bandpass
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 3000;
      filter.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.value = 0.08;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      this.nodes.push(source);
    } else if (sound === "bowls") {
      // Singing bowl: layered sine waves
      const freqs = [174, 285, 396];
      for (const freq of freqs) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = 0.03;
        // Slow tremolo
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.2 + Math.random() * 0.3;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.015;
        lfo.connect(lfoGain).connect(gain.gain);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        lfo.start();
        this.nodes.push(osc, lfo);
      }
    } else if (sound === "ocean") {
      // Brown noise for ocean
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      // Slow volume modulation for waves
      const gain = ctx.createGain();
      gain.gain.value = 0.12;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.06;
      lfo.connect(lfoGain).connect(gain.gain);
      source.connect(gain).connect(ctx.destination);
      source.start();
      lfo.start();
      this.nodes.push(source, lfo);
    }

    this.playing = true;
  }

  stop() {
    this.playing = false;
    try {
      this.ctx?.close();
    } catch {}
    this.ctx = null;
    this.nodes = [];
  }
}

export default function MeditationTimer({ config, balance, onBalanceChange, onPlay, isPlaying }: ArcadeGameProps) {
  const [duration, setDuration] = useState(300);
  const [customMin, setCustomMin] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [active, setActive] = useState(false);
  const [complete, setComplete] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sound, setSound] = useState<AmbientSound>("silence");
  const [streak, setStreak] = useState(0);
  const [karmaEarned, setKarmaEarned] = useState(0);
  const [locale, setLocale] = useState<"en" | "zh">("en");
  const [circleScale, setCircleScale] = useState(0.6);

  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const breathRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const synthRef = useRef(new AmbientSynth());
  const startTimeRef = useRef(0);

  useEffect(() => {
    setLocale(window.location.pathname.includes("/zh") ? "zh" : "en");
    setStreak(getStreak().count);
    return () => {
      synthRef.current.stop();
      clearInterval(timerRef.current);
      clearTimeout(breathRef.current);
    };
  }, []);

  // Breathing cycle
  useEffect(() => {
    if (!active) return;

    const cycle = () => {
      // Inhale
      setPhase("inhale");
      setCircleScale(1);
      breathRef.current = setTimeout(() => {
        // Hold
        setPhase("hold");
        breathRef.current = setTimeout(() => {
          // Exhale
          setPhase("exhale");
          setCircleScale(0.6);
          breathRef.current = setTimeout(cycle, PHASE_DURATIONS.exhale);
        }, PHASE_DURATIONS.hold);
      }, PHASE_DURATIONS.inhale);
    };

    cycle();
    return () => clearTimeout(breathRef.current);
  }, [active]);

  // Timer countdown
  useEffect(() => {
    if (!active) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Complete
          clearInterval(timerRef.current);
          setActive(false);
          setPhase("idle");
          setCircleScale(0.6);
          synthRef.current.stop();
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [active]);

  const handleComplete = useCallback(async () => {
    const newStreak = updateStreak();
    setStreak(newStreak);

    // Karma based on duration: 1 per minute, bonus for streaks
    const minutes = Math.ceil(duration / 60);
    const streakBonus = Math.min(newStreak, 10);
    const karma = minutes + streakBonus;
    setKarmaEarned(karma);

    const result = await onPlay({ duration, streak: newStreak });
    if (result && balance !== null) {
      onBalanceChange(balance + result.netPoints);
    }

    setComplete(true);
  }, [duration, balance, onPlay, onBalanceChange]);

  const startSession = () => {
    const dur = customMin ? parseInt(customMin) * 60 : duration;
    if (dur <= 0 || dur > 3600) return;
    setDuration(dur);
    setTimeLeft(dur);
    setActive(true);
    setComplete(false);
    setKarmaEarned(0);
    startTimeRef.current = Date.now();
    synthRef.current.start(sound);
  };

  const stopSession = () => {
    setActive(false);
    setPhase("idle");
    setCircleScale(0.6);
    setTimeLeft(0);
    synthRef.current.stop();
    clearInterval(timerRef.current);
    clearTimeout(breathRef.current);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const phaseLabels = PHASE_LABELS[locale];
  const soundLabels: Record<AmbientSound, string> = locale === "zh"
    ? { silence: "静默", rain: "雨声", bowls: "钵声", ocean: "海浪" }
    : { silence: "Silence", rain: "Rain", bowls: "Bowls", ocean: "Ocean" };

  const t = locale === "zh"
    ? { start: "开始冥想", stop: "停止", complete: "冥想完成", karma: "业力", streak: "连续天数", again: "再次冥想", custom: "自定义 (分钟)" }
    : { start: "Begin Meditation", stop: "Stop", complete: "Session Complete", karma: "karma earned", streak: "day streak", again: "Meditate Again", custom: "Custom (min)" };

  if (complete) {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="text-6xl">🪷</div>
        <h2 className="text-2xl font-light text-white">{t.complete}</h2>
        <div className="flex gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-emerald-400">+{karmaEarned}</p>
            <p className="text-xs text-gray-500 mt-1">{t.karma}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-amber-400">🔥 {streak}</p>
            <p className="text-xs text-gray-500 mt-1">{t.streak}</p>
          </div>
        </div>
        <button
          onClick={() => { setComplete(false); setCustomMin(""); }}
          className="px-6 py-2 rounded-full border border-white/20 text-white/70 hover:bg-white/5 transition-colors text-sm"
        >
          {t.again}
        </button>
        <style jsx>{`
          @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Breathing circle */}
      <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
        {/* Outer glow ring */}
        <div
          className="absolute rounded-full transition-all"
          style={{
            width: 240 * circleScale,
            height: 240 * circleScale,
            background: active
              ? "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
            transitionDuration: phase === "inhale" ? "4s" : phase === "exhale" ? "8s" : "0.3s",
            transitionTimingFunction: "ease-in-out",
          }}
        />

        {/* Main circle */}
        <div
          className="rounded-full flex items-center justify-center transition-all border"
          style={{
            width: 180 * circleScale,
            height: 180 * circleScale,
            background: active
              ? "radial-gradient(circle at 40% 40%, #064e3b, #0f172a)"
              : "radial-gradient(circle at 40% 40%, #1e1b4b, #0f172a)",
            borderColor: active ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.2)",
            transitionDuration: phase === "inhale" ? "4s" : phase === "exhale" ? "8s" : "0.3s",
            transitionTimingFunction: "ease-in-out",
            boxShadow: active ? "0 0 40px rgba(16,185,129,0.15)" : "0 0 20px rgba(99,102,241,0.1)",
          }}
        >
          <div className="text-center">
            {active ? (
              <>
                <p className="text-3xl font-light text-white/90 tabular-nums">{formatTime(timeLeft)}</p>
                <p className="text-xs text-emerald-400/80 mt-2 tracking-widest uppercase">{phaseLabels[phase]}</p>
              </>
            ) : (
              <p className="text-4xl">🧘</p>
            )}
          </div>
        </div>
      </div>

      {active ? (
        /* Active: stop button */
        <button
          onClick={stopSession}
          className="px-6 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
        >
          {t.stop}
        </button>
      ) : (
        /* Setup */
        <div className="w-full max-w-sm flex flex-col gap-5">
          {/* Duration presets */}
          <div className="flex gap-2 justify-center flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p.seconds}
                onClick={() => { setDuration(p.seconds); setCustomMin(""); }}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  duration === p.seconds && !customMin
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-white/10 text-white/50 hover:bg-white/5"
                }`}
              >
                {locale === "zh" ? p.labelZh : p.label}
              </button>
            ))}
          </div>

          {/* Custom */}
          <div className="flex items-center gap-2 justify-center">
            <input
              type="number"
              min="1"
              max="60"
              placeholder={t.custom}
              value={customMin}
              onChange={(e) => setCustomMin(e.target.value)}
              className="w-40 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm text-center placeholder:text-white/30 focus:outline-none focus:border-emerald-500/40"
            />
          </div>

          {/* Ambient sounds */}
          <div className="flex gap-2 justify-center">
            {(["silence", "rain", "bowls", "ocean"] as AmbientSound[]).map((s) => (
              <button
                key={s}
                onClick={() => setSound(s)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  sound === s
                    ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                    : "border-white/10 text-white/40 hover:bg-white/5"
                }`}
              >
                {s === "silence" ? "🔇" : s === "rain" ? "🌧️" : s === "bowls" ? "🔔" : "🌊"}{" "}
                {soundLabels[s]}
              </button>
            ))}
          </div>

          {/* Start */}
          <button
            onClick={startSession}
            className="mx-auto px-8 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            {t.start}
          </button>

          {/* Streak */}
          {streak > 0 && (
            <p className="text-center text-xs text-amber-400/60">
              🔥 {streak} {t.streak}
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}
