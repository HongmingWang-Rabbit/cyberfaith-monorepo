"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@cyberfaith/auth-client";

const plans = [
  {
    id: "free",
    monthlyPrice: 0,
    annualPrice: 0,
    features: ["freeFeature1", "freeFeature2", "freeFeature3"],
  },
  {
    id: "pro",
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    features: [
      "proFeature1",
      "proFeature2",
      "proFeature3",
      "proFeature4",
      "proFeature5",
    ],
  },
  {
    id: "premium",
    monthlyPrice: 19.99,
    annualPrice: 179.99,
    features: [
      "premiumFeature1",
      "premiumFeature2",
      "premiumFeature3",
      "premiumFeature4",
      "premiumFeature5",
    ],
  },
];

export default function PricingPage() {
  const t = useTranslations("pricing");
  const { session } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const token = session?.tokens?.accessToken || localStorage.getItem("token");
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: planId, interval: annual ? "year" : "month" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  };

  const getAnnualSavePercent = (plan: typeof plans[number]) => {
    if (plan.monthlyPrice === 0) return 0;
    return Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100);
  };

  const styleMap: Record<string, { border: string; bg: string; check: string; btn: string; badge?: string; badgeText?: string }> = {
    free: {
      border: "border-gray-700",
      bg: "bg-gray-900/60",
      check: "text-gray-500",
      btn: "",
    },
    pro: {
      border: "border-cyan-500",
      bg: "bg-gradient-to-b from-cyan-950/40 to-purple-950/40 shadow-lg shadow-cyan-500/20",
      check: "text-cyan-400",
      btn: "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg shadow-cyan-500/25",
      badge: "bg-gradient-to-r from-cyan-500 to-purple-500",
      badgeText: "recommended",
    },
    premium: {
      border: "border-amber-500",
      bg: "bg-gradient-to-b from-amber-950/40 to-orange-950/40 shadow-lg shadow-amber-500/20",
      check: "text-amber-400",
      btn: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/25",
      badge: "bg-gradient-to-r from-amber-500 to-orange-500",
      badgeText: "bestValue",
    },
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-center text-gray-400 mb-8">{t("subtitle")}</p>

        {/* Monthly / Annual Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium ${!annual ? "text-white" : "text-gray-500"}`}>
            {t("monthly")}
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              annual ? "bg-cyan-500" : "bg-gray-600"
            }`}
            aria-label="Toggle annual billing"
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                annual ? "translate-x-7" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-white" : "text-gray-500"}`}>
            {t("annually")}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const style = styleMap[plan.id];
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            const savePct = getAnnualSavePercent(plan);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-8 flex flex-col ${style.border} ${style.bg}`}
              >
                {style.badgeText && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${style.badge} text-white text-xs font-bold px-4 py-1 rounded-full`}>
                    {t(style.badgeText)}
                  </div>
                )}

                <h2 className="text-2xl font-bold text-white mb-2">
                  {t(`${plan.id}.name`)}
                </h2>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-white">${price}</span>
                  {price > 0 && (
                    <span className="text-gray-400 ml-1">
                      /{annual ? t("annual") : t("month")}
                    </span>
                  )}
                </div>
                {annual && savePct > 0 && (
                  <p className="text-sm text-green-400 mb-4">
                    {t("savePercent", { percent: savePct })}
                  </p>
                )}
                {(!annual || savePct === 0) && <div className="mb-4" />}

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-300">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${style.check}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t(feature)}
                    </li>
                  ))}
                </ul>

                {plan.id === "free" ? (
                  <div className="w-full py-3 px-6 rounded-xl font-semibold text-center text-gray-400 border border-gray-700">
                    {t("currentPlan")}
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading !== null}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all disabled:opacity-50 ${style.btn}`}
                  >
                    {loading === plan.id
                      ? t("processing")
                      : plan.id === "premium"
                        ? t("upgradePremium")
                        : t("upgrade")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
