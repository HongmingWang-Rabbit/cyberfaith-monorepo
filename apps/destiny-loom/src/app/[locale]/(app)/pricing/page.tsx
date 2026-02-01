"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

const plans = [
  {
    id: "free",
    price: 0,
    features: [
      "freeFeature1",
      "freeFeature2",
      "freeFeature3",
    ],
  },
  {
    id: "pro",
    price: 9.99,
    features: [
      "proFeature1",
      "proFeature2",
      "proFeature3",
      "proFeature4",
    ],
  },
];

export default function PricingPage() {
  const t = useTranslations("pricing");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-center text-gray-400 mb-12">{t("subtitle")}</p>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.id === "pro"
                  ? "border-cyan-500 bg-gradient-to-b from-cyan-950/40 to-purple-950/40 shadow-lg shadow-cyan-500/20"
                  : "border-gray-700 bg-gray-900/60"
              }`}
            >
              {plan.id === "pro" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {t("recommended")}
                </div>
              )}

              <h2 className="text-2xl font-bold text-white mb-2">
                {t(`${plan.id}.name`)}
              </h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  ${plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-400 ml-1">/{t("month")}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-gray-300">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 ${
                        plan.id === "pro" ? "text-cyan-400" : "text-gray-500"
                      }`}
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

              {plan.id === "pro" ? (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/25"
                >
                  {loading ? t("processing") : t("upgrade")}
                </button>
              ) : (
                <div className="w-full py-3 px-6 rounded-xl font-semibold text-center text-gray-400 border border-gray-700">
                  {t("currentPlan")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
