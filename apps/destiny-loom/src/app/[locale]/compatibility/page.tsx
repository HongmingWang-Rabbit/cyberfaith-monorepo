"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@cyberfaith/ui";
import { zodiacSigns } from "@/data/zodiac-signs";
import { useAuth } from "@cyberfaith/auth-client";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CompatibilityResult } from "@/components/compatibility/compatibility-result";
import { FriendPicker } from "@/components/compatibility/friend-picker";

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP",
];

export default function CompatibilityPage() {
  const t = useTranslations("compatibility");
  const ct = useTranslations("common");
  const { isAuthenticated } = useAuth();
  const [sign1, setSign1] = useState("");
  const [sign2, setSign2] = useState("");
  const [mbti1, setMbti1] = useState("");
  const [mbti2, setMbti2] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFriendPicker, setShowFriendPicker] = useState(false);

  const handleCompare = async () => {
    if (!sign1 || !sign2) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/zodiac/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sign1,
          sign2,
          mbtiType1: mbti1 || undefined,
          mbtiType2: mbti2 || undefined,
          locale: document.documentElement.lang || "en",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data.compatibility);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendSelect = async (friendId: string) => {
    setShowFriendPicker(false);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/zodiac/compatibility/friend/${friendId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ locale: document.documentElement.lang || "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data.compatibility);
      if (data.sign1) setSign1(data.sign1);
      if (data.sign2) setSign2(data.sign2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const signData = (id: string) => zodiacSigns.find((s) => s.id === id);

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 pb-24">
      <Breadcrumb current={t("title")} />
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t("subtitle")}</p>
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-6 space-y-6">
          {/* Sign selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("person1")}</label>
              <select
                value={sign1}
                onChange={(e) => setSign1(e.target.value)}
                className="w-full p-3 rounded-lg bg-muted/50 border border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="">{t("selectSign")}</option>
                {zodiacSigns.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.symbol} {s.name} ({s.nameZh})
                  </option>
                ))}
              </select>
              <select
                value={mbti1}
                onChange={(e) => setMbti1(e.target.value)}
                className="w-full p-2 rounded-lg bg-muted/30 border border-border text-sm text-muted-foreground focus:border-primary transition-colors"
              >
                <option value="">{t("mbtiOptional")}</option>
                {MBTI_TYPES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("person2")}</label>
              <select
                value={sign2}
                onChange={(e) => setSign2(e.target.value)}
                className="w-full p-3 rounded-lg bg-muted/50 border border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="">{t("selectSign")}</option>
                {zodiacSigns.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.symbol} {s.name} ({s.nameZh})
                  </option>
                ))}
              </select>
              <select
                value={mbti2}
                onChange={(e) => setMbti2(e.target.value)}
                className="w-full p-2 rounded-lg bg-muted/30 border border-border text-sm text-muted-foreground focus:border-primary transition-colors"
              >
                <option value="">{t("mbtiOptional")}</option>
                {MBTI_TYPES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vs display */}
          {sign1 && sign2 && (
            <div className="flex items-center justify-center gap-6 py-4">
              <div className="text-center">
                <span className="text-5xl">{signData(sign1)?.symbol}</span>
                <p className="text-sm mt-1 text-foreground">{signData(sign1)?.name}</p>
              </div>
              <span className="text-3xl font-bold text-primary animate-pulse">VS</span>
              <div className="text-center">
                <span className="text-5xl">{signData(sign2)?.symbol}</span>
                <p className="text-sm mt-1 text-foreground">{signData(sign2)?.name}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCompare}
              disabled={!sign1 || !sign2 || loading}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              {loading ? ct("ai.loading") : t("compare")}
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setShowFriendPicker(true)}
                className="px-6 py-3 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 font-semibold transition-all"
              >
                {t("compareWithFriend")}
              </button>
            )}
          </div>

          {/* Matrix link */}
          <div className="text-center">
            <Link
              href="/compatibility/matrix"
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline decoration-dashed underline-offset-4"
            >
              {t("viewMatrix")}
            </Link>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-center">
          {error}
        </div>
      )}

      {result && <CompatibilityResult data={result} sign1={sign1} sign2={sign2} />}

      {showFriendPicker && (
        <FriendPicker
          onSelect={handleFriendSelect}
          onClose={() => setShowFriendPicker(false)}
        />
      )}
    </div>
  );
}
