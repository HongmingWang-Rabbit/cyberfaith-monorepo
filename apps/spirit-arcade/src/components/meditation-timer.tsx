"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { t } from "@/lib/i18n";

const DURATIONS = [1, 5, 10, 15, 30];

const SOUNDS = [
  { id: "none", emoji: "🔇" },
  { id: "rain", emoji: "🌧️" },
  { id: "ocean", emoji: "🌊" },
  { id: "bells", emoji: "🔔" },
  { id: "bowl", emoji: "🎵" },
] as const;

type SoundId = (typeof SOUNDS)[number]["id"];
type TimerState = "setup" | "running" | "paused" | "complete";
type BreathPhase = "in" | "hold" | "out";

export function MeditationTimer() {
  const [timerState, setTimerState] = useState<TimerState>("setup");
  const [duration, setDuration] = useState(5);
  const [sound, setSound] = useState<SoundId>("none");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("in");
  const [result, setResult] = useState<{ points: number; streak: number; bonus: boolean } | null>(null);
  const [stats, setStats] = useState<{ totalMinutes: number; totalSessions: number; streakDays: number; todaySessions: number } | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch stats on mount
  useEffect(() => {
    fetch("/api/arcade/meditation/stats")
      .then((r) => r.json())
      .then((j) => { if (j.success) setStats(j.data); })
      .catch(() => {});
  }, []);

  // Breathing cycle: 4s in, 4s hold, 4s out
  useEffect(() => {
    if (timerState === "running") {
      let phase = 0; // 0=in, 1=hold, 2=out
      const phases: BreathPhase[] = ["in", "hold", "out"];
      setBreathPhase("in");
      breathRef.current = setInterval(() => {
        phase = (phase + 1) % 3;
        setBreathPhase(phases[phase]!);
      }, 4000);
    } else {
      if (breathRef.current) clearInterval(breathRef.current);
    }
    return () => { if (breathRef.current) clearInterval(breathRef.current); };
  }, [timerState]);

  // Timer countdown
  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerState]); // eslint-disable-line react-hooks/exhaustive-deps

  const completeSession = useCallback(async () => {
    setTimerState("complete");
    try {
      const res = await fetch("/api/arcade/meditation/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMinutes: duration, soundUsed: sound }),
      });
      const json = await res.json();
      if (json.success) {
        setResult({
          points: json.data.pointsEarned,
          streak: json.data.streakDays,
          bonus: json.data.streakBonus,
        });
        // Refresh stats
        const sr = await fetch("/api/arcade/meditation/stats");
        const sj = await sr.json();
        if (sj.success) setStats(sj.data);
      }
    } catch {
      // Still show complete state
    }
  }, [duration, sound]);

  const start = () => {
    setSecondsLeft(duration * 60);
    setTimerState("running");
    setResult(null);
  };

  const pause = () => setTimerState("paused");
  const resume = () => setTimerState("running");
  const stop = () => {
    setTimerState("setup");
    setSecondsLeft(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const breathScale = breathPhase === "in" ? 1.4 : breathPhase === "hold" ? 1.4 : 0.8;
  const breathLabel =
    breathPhase === "in" ? t("meditation.breatheIn") :
    breathPhase === "hold" ? t("meditation.hold") :
    t("meditation.breatheOut");

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <h2 className="text-3xl font-bold text-teal-400">{t("meditation.title")}</h2>
      <p className="text-muted-foreground">{t("meditation.subtitle")}</p>

      {/* Stats row */}
      {stats && (
        <div className="flex gap-6 text-center text-sm">
          <div>
            <div className="text-2xl font-bold text-teal-400">{stats.totalMinutes}</div>
            <div className="text-muted-foreground">{t("meditation.stats.totalMinutes")}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{stats.totalSessions}</div>
            <div className="text-muted-foreground">{t("meditation.stats.totalSessions")}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">🔥 {stats.streakDays}</div>
            <div className="text-muted-foreground">{t("meditation.stats.streak")}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{stats.todaySessions}</div>
            <div className="text-muted-foreground">{t("meditation.stats.todaySessions")}</div>
          </div>
        </div>
      )}

      {/* Breathing circle */}
      {(timerState === "running" || timerState === "paused") && (
        <div className="relative flex flex-col items-center gap-4">
          <div
            className="w-48 h-48 rounded-full flex items-center justify-center transition-transform duration-[4000ms] ease-in-out"
            style={{
              transform: `scale(${timerState === "running" ? breathScale : 1})`,
              background: "radial-gradient(circle, rgba(20,184,166,0.3), rgba(20,184,166,0.05))",
              boxShadow: `0 0 ${timerState === "running" ? 60 : 30}px rgba(20,184,166,0.3)`,
            }}
          >
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-teal-300">{formatTime(secondsLeft)}</div>
              {timerState === "running" && (
                <div className="text-sm text-teal-400 mt-2">{breathLabel}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Setup */}
      {timerState === "setup" && (
        <div className="flex flex-col items-center gap-6">
          {/* Duration selector */}
          <div>
            <div className="text-sm text-muted-foreground mb-2 text-center">{t("meditation.duration")}</div>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    duration === d
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {d} {t("meditation.minutes")}
                </button>
              ))}
            </div>
          </div>

          {/* Sound selector */}
          <div>
            <div className="text-sm text-muted-foreground mb-2 text-center">{t("meditation.sounds.title")}</div>
            <div className="flex gap-2">
              {SOUNDS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSound(s.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    sound === s.id
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {s.emoji} {t(`meditation.sounds.${s.id}`)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={start}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-full
              hover:from-teal-400 hover:to-cyan-400 transition-all shadow-lg hover:shadow-teal-500/25"
          >
            🧘 {t("meditation.start")}
          </button>
        </div>
      )}

      {/* Controls during session */}
      {(timerState === "running" || timerState === "paused") && (
        <div className="flex gap-4">
          {timerState === "running" ? (
            <button
              onClick={pause}
              className="px-6 py-2 bg-yellow-500/20 text-yellow-400 rounded-full hover:bg-yellow-500/30 transition-all"
            >
              ⏸ {t("meditation.pause")}
            </button>
          ) : (
            <button
              onClick={resume}
              className="px-6 py-2 bg-teal-500/20 text-teal-400 rounded-full hover:bg-teal-500/30 transition-all"
            >
              ▶ {t("meditation.resume")}
            </button>
          )}
          <button
            onClick={stop}
            className="px-6 py-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-all"
          >
            ⏹ {t("meditation.stop")}
          </button>
        </div>
      )}

      {/* Complete */}
      {timerState === "complete" && (
        <div className="text-center space-y-3 animate-fadeIn">
          <div className="text-3xl">🙏</div>
          <div className="text-2xl font-bold text-teal-400">{t("meditation.complete")}</div>
          {result && (
            <>
              <div className="text-green-400 font-bold">{t("meditation.earned", { points: result.points })}</div>
              {result.bonus && (
                <div className="text-amber-400">{t("meditation.streakBonus", { bonus: 5 })}</div>
              )}
              <div className="text-muted-foreground">
                🔥 {t("common.streak")}: {result.streak} {t("common.days")}
              </div>
            </>
          )}
          <button
            onClick={() => setTimerState("setup")}
            className="mt-4 px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
          >
            {t("meditation.start")}
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}
