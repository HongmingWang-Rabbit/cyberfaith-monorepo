"use client";

import { useState, useCallback } from "react";
import { t } from "@/lib/i18n";

type CookieState = "idle" | "cracking" | "cracked" | "limit";

export function FortuneCookie() {
  const [state, setState] = useState<CookieState>("idle");
  const [fortune, setFortune] = useState("");
  const [points, setPoints] = useState(0);

  const crack = useCallback(async () => {
    setState("cracking");
    try {
      const res = await fetch("/api/arcade/fortune-cookie/crack", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "DAILY_LIMIT_REACHED") {
          setState("limit");
          return;
        }
        throw new Error(json.message);
      }
      setFortune(json.data.fortune);
      setPoints(json.data.pointsEarned);
      setState("cracked");
    } catch {
      setState("idle");
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <h2 className="text-3xl font-bold text-amber-400">{t("fortuneCookie.title")}</h2>
      <p className="text-muted-foreground">{t("fortuneCookie.subtitle")}</p>

      {/* 3D Cookie */}
      <div className="relative w-48 h-48 perspective-500">
        <div
          className={`
            relative w-full h-full transition-all duration-1000 ease-out
            ${state === "cracking" ? "animate-shake" : ""}
            ${state === "cracked" ? "scale-0 opacity-0" : ""}
          `}
        >
          {/* Cookie halves */}
          <div
            className={`
              absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full
              shadow-[0_0_30px_rgba(245,158,11,0.3)] cursor-pointer
              hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transition-shadow
              ${state === "cracked" ? "cookie-split-left" : ""}
            `}
            style={{
              clipPath: "ellipse(50% 40% at 50% 50%)",
              transform: state === "cracked" ? "translateX(-60px) rotate(-30deg)" : "",
            }}
          />
          <div
            className={`
              absolute inset-0 bg-gradient-to-bl from-amber-500 to-amber-700 rounded-full
              ${state === "cracked" ? "cookie-split-right" : ""}
            `}
            style={{
              clipPath: "ellipse(50% 40% at 50% 50%)",
              transform: state === "cracked" ? "translateX(60px) rotate(30deg)" : "",
            }}
          />
          {/* Crease line */}
          <div className="absolute top-1/2 left-1/4 right-1/4 h-px bg-amber-900/50" />
        </div>

        {/* Fortune paper */}
        {state === "cracked" && (
          <div className="absolute inset-0 flex items-center justify-center animate-fadeInUp">
            <div className="bg-amber-50 text-amber-900 px-6 py-4 rounded shadow-lg max-w-xs text-center">
              <p className="text-sm font-serif italic leading-relaxed">{fortune}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      {state === "idle" && (
        <button
          onClick={crack}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full
            hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg hover:shadow-amber-500/25"
        >
          🥠 {t("fortuneCookie.crack")}
        </button>
      )}

      {state === "cracking" && (
        <div className="text-amber-400 animate-pulse">{t("fortuneCookie.cracking")}</div>
      )}

      {state === "cracked" && (
        <div className="text-center space-y-2">
          <div className="text-green-400 font-bold">✨ {t("fortuneCookie.earned", { points })}</div>
          <p className="text-muted-foreground text-sm">{t("fortuneCookie.comeBack")}</p>
        </div>
      )}

      {state === "limit" && (
        <div className="text-center space-y-2">
          <div className="text-yellow-400">{t("fortuneCookie.alreadyCracked")}</div>
          <p className="text-muted-foreground text-sm">{t("fortuneCookie.comeBack")}</p>
        </div>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          10% { transform: translateX(-8px) rotate(-3deg); }
          20% { transform: translateX(8px) rotate(3deg); }
          30% { transform: translateX(-6px) rotate(-2deg); }
          40% { transform: translateX(6px) rotate(2deg); }
          50% { transform: translateX(-4px) rotate(-1deg); }
          60% { transform: translateX(4px) rotate(1deg); }
          70% { transform: translateX(-2px) rotate(0); }
          80% { transform: translateX(2px) rotate(0); }
          90% { transform: translateX(-1px); }
        }
        .animate-shake { animation: shake 0.8s ease-in-out; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
      `}</style>
    </div>
  );
}
