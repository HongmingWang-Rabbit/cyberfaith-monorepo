"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@cyberfaith/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptic } from "@/hooks/useHaptic";

const ZODIAC_SIGNS = [
  { key: "aries", icon: "♈", emoji: "🐏" },
  { key: "taurus", icon: "♉", emoji: "🐂" },
  { key: "gemini", icon: "♊", emoji: "👯" },
  { key: "cancer", icon: "♋", emoji: "🦀" },
  { key: "leo", icon: "♌", emoji: "🦁" },
  { key: "virgo", icon: "♍", emoji: "🌾" },
  { key: "libra", icon: "♎", emoji: "⚖️" },
  { key: "scorpio", icon: "♏", emoji: "🦂" },
  { key: "sagittarius", icon: "♐", emoji: "🏹" },
  { key: "capricorn", icon: "♑", emoji: "🐐" },
  { key: "aquarius", icon: "♒", emoji: "🏺" },
  { key: "pisces", icon: "♓", emoji: "🐟" },
];

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

const INTERESTS = [
  { key: "tarot", icon: "🃏" },
  { key: "numerology", icon: "🔢" },
  { key: "fengShui", icon: "🏯" },
  { key: "dreams", icon: "🌙" },
  { key: "zodiac", icon: "⭐" },
  { key: "iching", icon: "☯️" },
  { key: "mbti", icon: "🧠" },
  { key: "birthChart", icon: "🌌" },
  { key: "compatibility", icon: "💞" },
  { key: "meditation", icon: "🧘" },
];

const TOTAL_STEPS = 4;

const bgParticles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 4,
  delay: Math.random() * 4,
}));

function CyberBackground({ step }: { step: number }) {
  const colors = [
    "from-purple-900/40 via-indigo-900/30 to-black",
    "from-violet-900/40 via-purple-900/30 to-black",
    "from-fuchsia-900/40 via-purple-900/30 to-black",
    "from-cyan-900/40 via-purple-900/30 to-black",
  ];
  return (
    <div className="fixed inset-0 -z-10">
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[step]} transition-all duration-1000`} />
      {bgParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const router = useRouter();
  const { session } = useAuth();
  const { vibrate } = useHaptic();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [zodiac, setZodiac] = useState("");
  const [mbti, setMbti] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const next = useCallback(() => {
    vibrate("light");
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, [vibrate]);

  const back = useCallback(() => {
    vibrate("light");
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, [vibrate]);

  const toggleInterest = (key: string) => {
    vibrate("selection");
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const saveAndFinish = async () => {
    setSaving(true);
    vibrate("success");
    try {
      const token = session?.tokens?.accessToken;
      if (token) {
        await fetch("/api/settings", {
          method: "PATCH",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify({
            mbtiType: mbti || null,
            onboardingCompleted: true,
            interests,
          }),
        });
        if (zodiac) {
          await fetch("/api/zodiac/set", {
            method: "PATCH",
            headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
            body: JSON.stringify({ zodiacSign: zodiac }),
          });
        }
      }
    } catch {}

    // Route to recommended reading based on interests
    const interestToRoute: Record<string, string> = {
      tarot: "/tarot",
      zodiac: "/zodiac",
      iching: "/i-ching",
      mbti: "/mbti",
      dreams: "/dream",
      numerology: "/numerology",
      fengShui: "/feng-shui",
      birthChart: "/birth-chart",
      compatibility: "/compatibility",
      meditation: "/arcade",
    };
    const first = interests[0];
    const dest = first && interestToRoute[first] ? interestToRoute[first] : "/";
    router.push(dest);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CyberBackground step={step} />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted/30">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent"
          animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Step 0: Zodiac */}
              {step === 0 && (
                <div className="space-y-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="text-6xl"
                  >
                    🔮
                  </motion.div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {t("welcome")}
                  </h1>
                  <p className="text-muted-foreground">{t("zodiacPrompt")}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {ZODIAC_SIGNS.map((sign) => (
                      <motion.button
                        key={sign.key}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          vibrate("selection");
                          setZodiac(sign.key);
                        }}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-sm ${
                          zodiac === sign.key
                            ? "border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                            : "border-border/50 bg-card/30 text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        <span className="text-2xl">{sign.icon}</span>
                        <span className="capitalize text-xs">{t(`signs.${sign.key}`)}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: MBTI */}
              {step === 1 && (
                <div className="space-y-6 text-center">
                  <div className="text-5xl">🧠</div>
                  <h2 className="text-2xl font-bold text-foreground">{t("mbtiPrompt")}</h2>
                  <p className="text-muted-foreground text-sm">{t("mbtiSubtext")}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {MBTI_TYPES.map((type) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          vibrate("selection");
                          setMbti(type);
                        }}
                        className={`p-2.5 rounded-lg border text-sm font-mono font-bold transition-all ${
                          mbti === type
                            ? "border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                            : "border-border/50 bg-card/30 text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {type}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Interests */}
              {step === 2 && (
                <div className="space-y-6 text-center">
                  <div className="text-5xl">✨</div>
                  <h2 className="text-2xl font-bold text-foreground">{t("interestsPrompt")}</h2>
                  <p className="text-muted-foreground text-sm">{t("interestsSubtext")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {INTERESTS.map((item) => {
                      const selected = interests.includes(item.key);
                      return (
                        <motion.button
                          key={item.key}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => toggleInterest(item.key)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            selected
                              ? "border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                              : "border-border/50 bg-card/30 text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-sm font-medium">{t(`interests.${item.key}`)}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Finish */}
              {step === 3 && (
                <div className="space-y-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="text-7xl"
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {t("readyTitle")}
                  </h2>
                  <p className="text-muted-foreground">{t("readySubtext")}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveAndFinish}
                    disabled={saving}
                    className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-shadow disabled:opacity-60"
                  >
                    {saving ? "..." : t("startReading")}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="sticky bottom-0 p-4 flex items-center justify-between max-w-lg mx-auto w-full">
        {step > 0 ? (
          <button
            onClick={back}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {tc("actions.back")}
          </button>
        ) : (
          <div />
        )}
        {step < TOTAL_STEPS - 1 && (
          <div className="flex gap-2">
            <button
              onClick={next}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("skip")}
            </button>
            <button
              onClick={next}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all"
            >
              {tc("actions.next")} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
