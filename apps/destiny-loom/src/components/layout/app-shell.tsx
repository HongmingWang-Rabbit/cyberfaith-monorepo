"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useAuth } from "@cyberfaith/auth-client";
import { useState, useRef, useEffect } from "react";

const navItems = [
  { key: "home", href: "/", icon: "🏠" },
  { key: "mbti", href: "/mbti", icon: "🧠" },
  { key: "tarot", href: "/tarot", icon: "🃏" },
  { key: "zodiac", href: "/zodiac", icon: "⭐" },
  { key: "iching", href: "/i-ching", icon: "☯️" },
  { key: "fourPillars", href: "/four-pillars", icon: "🏛️" },
  { key: "community", href: "/community", icon: "🌐" },
  { key: "arcade", href: "/arcade", icon: "🕹️" },
  { key: "profile", href: "/profile", icon: "👤" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: authLoading, loginWithGoogle, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="cyber-grid" />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-40 border-r border-border bg-card/80 backdrop-blur-md">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🔮</span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("title")}
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-primary/15 text-primary shadow-[var(--glow-purple)] border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{t(`nav.${item.key}`)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-border bg-card/60 backdrop-blur-md">
          <div className="md:hidden flex items-center gap-2">
            <span className="text-lg">🔮</span>
            <span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("title")}
            </span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            {authLoading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 h-8 px-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                      {(user.name || user.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-foreground hidden sm:inline max-w-[100px] truncate">
                    {user.name || user.email}
                  </span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    >
                      👤 {t("auth.profile")}
                    </Link>
                    <button
                      onClick={() => { logout(); setShowDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      🚪 {t("auth.signOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="h-8 px-3 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                {t("auth.signIn")}
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around h-16 border-t border-border bg-card/80 backdrop-blur-md">
        {navItems.slice(0, 5).map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{t(`nav.${item.key}`)}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .cyber-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridMove 20s linear infinite;
        }
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
      `}</style>
    </div>
  );
}
