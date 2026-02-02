"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useHaptic } from "@/hooks/useHaptic";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const readingItems = [
  { key: "tarot", href: "/tarot", icon: "🃏" },
  { key: "zodiac", href: "/zodiac", icon: "⭐" },
  { key: "iching", href: "/i-ching", icon: "☯️" },
  { key: "mbti", href: "/mbti", icon: "🧠" },
  { key: "fourPillars", href: "/four-pillars", icon: "🏛️" },
  { key: "dream", href: "/dream", icon: "🌙" },
  { key: "numerology", href: "/numerology", icon: "🔢" },
  { key: "fengShui", href: "/feng-shui", icon: "🏯" },
  { key: "birthChart", href: "/birth-chart", icon: "🌌" },
  { key: "compatibility", href: "/compatibility", icon: "💞" },
] as const;

interface NavItem {
  key: string;
  href: string;
  icon: string;
  hasDropdown?: boolean;
}

const mainItems: NavItem[] = [
  { key: "home", href: "/", icon: "🏠" },
  { key: "readings", href: "/tarot", icon: "📖", hasDropdown: true },
  { key: "arcade", href: "/arcade", icon: "🕹️" },
  { key: "community", href: "/community", icon: "🌐" },
  { key: "profile", href: "/profile", icon: "👤" },
];

const readingPaths = readingItems.map((r) => r.href);

export function BottomNav() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const direction = useScrollDirection();
  const { vibrate } = useHaptic();
  const [showReadings, setShowReadings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowReadings(false);
      }
    }
    if (showReadings) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showReadings]);

  const isActive = (item: NavItem) => {
    if (item.key === "home") return pathname === "/";
    if (item.key === "readings") return readingPaths.some((p) => pathname.startsWith(p));
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Readings dropdown */}
      <AnimatePresence>
        {showReadings && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[4.5rem] left-2 right-2 z-50 p-3 rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]"
          >
            <div className="grid grid-cols-5 gap-2">
              {readingItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => {
                      vibrate("selection");
                      setShowReadings(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all ${
                      active
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="truncate w-full text-center">{t(`nav.${item.key}`)}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <motion.nav
        aria-label="Mobile navigation"
        initial={false}
        animate={{ y: direction === "down" ? 80 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around h-[4.25rem] border-t border-border bg-card/80 backdrop-blur-xl safe-bottom"
      >
        {mainItems.map((item) => {
          const active = isActive(item);
          return (
            <div key={item.key} className="relative flex-1 flex justify-center">
              {item.hasDropdown ? (
                <button
                  onClick={() => {
                    vibrate("selection");
                    setShowReadings(!showReadings);
                  }}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-xs transition-colors relative ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_2px_rgba(168,85,247,0.6)]" />
                  )}
                  <span className="text-xl">{item.icon}</span>
                  <span>{t("nav.readings")}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => vibrate("selection")}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-xs transition-colors relative ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_2px_rgba(168,85,247,0.6)]" />
                  )}
                  <span className="text-xl">{item.icon}</span>
                  <span>{t(`nav.${item.key}`)}</span>
                </Link>
              )}
            </div>
          );
        })}
      </motion.nav>
    </>
  );
}
