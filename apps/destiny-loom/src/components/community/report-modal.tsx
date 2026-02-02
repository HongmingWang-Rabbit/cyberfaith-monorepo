"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface ReportModalProps {
  targetType: "reading" | "comment" | "user";
  targetId: string;
  onClose: () => void;
}

const REASONS = ["spam", "inappropriate", "harassment", "other"] as const;

export function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const t = useTranslations("report");
  const { session } = useAuth();
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = session?.tokens?.accessToken;

  const handleSubmit = async () => {
    if (!reason || !token || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetType, targetId, reason, details: details || undefined }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(onClose, 2000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-sm shadow-2xl shadow-primary/10 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-8">
            <span className="text-4xl">✅</span>
            <p className="text-foreground mt-3">{t("success")}</p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                🚩 {t("title")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
            </div>

            <div className="space-y-2">
              {REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                    reason === r
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-muted/20 border border-transparent hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{t(`reason.${r}`)}</span>
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
              placeholder={t("detailsPlaceholder")}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-primary/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-primary/20 text-sm text-muted-foreground hover:text-foreground transition"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500/80 text-white text-sm font-medium hover:bg-red-500 disabled:opacity-50 transition"
              >
                {submitting ? "..." : t("submit")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ReportButton({
  targetType,
  targetId,
  className = "",
}: {
  targetType: "reading" | "comment" | "user";
  targetId: string;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`text-muted-foreground hover:text-red-400 transition ${className}`}
        title="Report"
      >
        🚩
      </button>
      {open && <ReportModal targetType={targetType} targetId={targetId} onClose={() => setOpen(false)} />}
    </>
  );
}
