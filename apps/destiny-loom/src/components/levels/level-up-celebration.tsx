"use client";

import { useEffect, useState } from "react";
import type { LevelInfo } from "./level-badge";

export function LevelUpCelebration({ level, onClose }: { level: LevelInfo; onClose: () => void }) {
  const [show, setShow] = useState(true);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  useEffect(() => {
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: ["#fbbf24", "#a855f7", "#3b82f6", "#ef4444", "#10b981"][Math.floor(Math.random() * 5)],
    }));
    setConfetti(particles);

    const timer = setTimeout(() => {
      setShow(false);
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      {/* Confetti */}
      {confetti.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${p.left}%`,
            top: "-10px",
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Modal */}
      <div className="relative bg-card border border-primary/30 rounded-2xl p-8 text-center max-w-sm mx-4 shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-in zoom-in-95 fade-in duration-300">
        <div className="text-6xl mb-4">{level.emoji}</div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent mb-2">
          Level Up!
        </h2>
        <p className="text-lg font-semibold" style={{ color: level.color }}>
          {level.name}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Your spiritual journey continues to new heights!
        </p>
        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 rounded-lg bg-primary/20 text-primary font-medium hover:bg-primary/30 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
