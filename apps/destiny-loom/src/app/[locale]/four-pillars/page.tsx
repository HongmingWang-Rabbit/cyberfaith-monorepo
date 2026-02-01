"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent } from "@cyberfaith/ui";
import { useState } from "react";

export default function FourPillarsPage() {
  const t = useTranslations("fourPillars");
  const tc = useTranslations("common");
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);
  const [gender, setGender] = useState("other");

  const handleSubmit = () => {
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
      day: String(day),
      hour: String(hour),
      gender,
    });
    router.push(`/four-pillars/result?${params.toString()}`);
  };

  const selectClass =
    "w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all appearance-none";
  const labelClass = "block text-sm font-medium text-muted-foreground mb-1";

  return (
    <div className="max-w-xl mx-auto py-8 space-y-8 pb-24">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      <Card className="border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
        <CardContent className="p-6 space-y-5">
          <p className="text-sm text-muted-foreground text-center">
            {t("instruction")}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Year */}
            <div>
              <label className={labelClass}>{t("year")}</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: 124 }, (_, i) => currentYear - i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className={labelClass}>{t("month")}</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Day */}
            <div>
              <label className={labelClass}>{t("day")}</label>
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Hour */}
            <div>
              <label className={labelClass}>{t("hour")}</label>
              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className={labelClass}>{t("gender")}</label>
            <div className="flex gap-3">
              {(["male", "female", "other"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    gender === g
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "bg-muted/30 text-muted-foreground border-border hover:border-primary/30"
                  }`}
                >
                  {t(`genders.${g}`)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all"
          >
            {t("calculate")}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
