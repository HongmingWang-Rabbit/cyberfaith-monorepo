"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Modal } from "@cyberfaith/ui";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "@/i18n/navigation";
import { useState, useEffect, useCallback } from "react";

interface UserSettings {
  displayName: string | null;
  mbtiType: string | null;
  notificationEmailDigest: boolean;
  notificationPush: boolean;
  notificationStreakReminders: boolean;
  theme: string;
  language: string;
  privacyProfileVisible: boolean;
  privacyReadingVisible: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  displayName: null,
  mbtiType: null,
  notificationEmailDigest: true,
  notificationPush: true,
  notificationStreakReminders: true,
  theme: "dark",
  language: "en",
  privacyProfileVisible: true,
  privacyReadingVisible: true,
};

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer group">
      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
          checked ? "bg-primary shadow-[0_0_10px_rgba(168,85,247,0.4)]" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { user, session, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [zodiacSign, setZodiacSign] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      const token = session?.tokens?.accessToken;
      if (!token) return;
      const res = await fetch("/api/settings", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { data } = await res.json();
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
      // Also get zodiac from user
      if (user && (user as any).zodiacSign) {
        setZodiacSign((user as any).zodiacSign);
      }
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, user, fetchSettings]);

  const saveSection = async (section: string, updates: Partial<UserSettings>) => {
    setSaving(section);
    try {
      const token = session?.tokens?.accessToken;
      if (!token) return;
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setSettings((prev) => ({ ...prev, ...updates }));
        showToast(t("saved"), "success");
      } else {
        showToast(t("saveFailed"), "error");
      }
    } catch {
      showToast(t("saveFailed"), "error");
    } finally {
      setSaving(null);
    }
  };

  const saveZodiac = async () => {
    setSaving("profile");
    try {
      const token = session?.tokens?.accessToken;
      if (!token) return;
      const res = await fetch("/api/zodiac/set", {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ zodiacSign }),
      });
      if (res.ok) {
        showToast(t("saved"), "success");
      }
    } catch {
      // ignore
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = session?.tokens?.accessToken;
      if (!token) return;
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast(t("accountDeleted"), "success");
        logout();
        router.push("/");
      } else {
        showToast(t("saveFailed"), "error");
      }
    } catch {
      showToast(t("saveFailed"), "error");
    }
    setShowDeleteModal(false);
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground">{t("loginRequired")}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            👤 {t("profile.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{t("profile.displayName")}</label>
            <Input
              value={settings.displayName || ""}
              onChange={(e) => setSettings((s) => ({ ...s, displayName: e.target.value }))}
              placeholder={user?.name || ""}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{t("profile.zodiacSign")}</label>
            <select
              value={zodiacSign}
              onChange={(e) => setZodiacSign(e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
            >
              <option value="">{t("profile.selectSign")}</option>
              {ZODIAC_SIGNS.map((sign) => (
                <option key={sign} value={sign}>
                  {sign.charAt(0).toUpperCase() + sign.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{t("profile.mbtiType")}</label>
            <select
              value={settings.mbtiType || ""}
              onChange={(e) => setSettings((s) => ({ ...s, mbtiType: e.target.value || null }))}
              className="flex h-10 w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
            >
              <option value="">{t("profile.selectMbti")}</option>
              {MBTI_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <Button
            onClick={async () => {
              await saveSection("profile", {
                displayName: settings.displayName,
                mbtiType: settings.mbtiType,
              });
              if (zodiacSign) await saveZodiac();
            }}
            disabled={saving === "profile"}
            size="sm"
          >
            {saving === "profile" ? t("saving") : tc("actions.save")}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            🔔 {t("notifications.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Toggle
            checked={settings.notificationEmailDigest}
            onChange={(v) => setSettings((s) => ({ ...s, notificationEmailDigest: v }))}
            label={t("notifications.emailDigest")}
          />
          <Toggle
            checked={settings.notificationPush}
            onChange={(v) => setSettings((s) => ({ ...s, notificationPush: v }))}
            label={t("notifications.push")}
          />
          <Toggle
            checked={settings.notificationStreakReminders}
            onChange={(v) => setSettings((s) => ({ ...s, notificationStreakReminders: v }))}
            label={t("notifications.streakReminders")}
          />
          <div className="pt-3">
            <Button
              onClick={() =>
                saveSection("notifications", {
                  notificationEmailDigest: settings.notificationEmailDigest,
                  notificationPush: settings.notificationPush,
                  notificationStreakReminders: settings.notificationStreakReminders,
                })
              }
              disabled={saving === "notifications"}
              size="sm"
            >
              {saving === "notifications" ? t("saving") : tc("actions.save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            🎨 {t("appearance.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{t("appearance.theme")}</label>
            <div className="flex gap-2">
              {(["dark", "light", "system"] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSettings((s) => ({ ...s, theme }))}
                  className={`flex-1 py-2 px-3 rounded-md text-sm border transition-all duration-200 ${
                    settings.theme === theme
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "💻"}{" "}
                  {t(`appearance.themes.${theme}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{t("appearance.language")}</label>
            <div className="flex gap-2">
              {(["en", "zh"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSettings((s) => ({ ...s, language: lang }))}
                  className={`flex-1 py-2 px-3 rounded-md text-sm border transition-all duration-200 ${
                    settings.language === lang
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {tc(`locale.${lang}`)}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={() => saveSection("appearance", { theme: settings.theme, language: settings.language })}
            disabled={saving === "appearance"}
            size="sm"
          >
            {saving === "appearance" ? t("saving") : tc("actions.save")}
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            🔒 {t("privacy.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Toggle
            checked={settings.privacyProfileVisible}
            onChange={(v) => setSettings((s) => ({ ...s, privacyProfileVisible: v }))}
            label={t("privacy.profileVisible")}
          />
          <Toggle
            checked={settings.privacyReadingVisible}
            onChange={(v) => setSettings((s) => ({ ...s, privacyReadingVisible: v }))}
            label={t("privacy.readingVisible")}
          />
          <div className="pt-3">
            <Button
              onClick={() =>
                saveSection("privacy", {
                  privacyProfileVisible: settings.privacyProfileVisible,
                  privacyReadingVisible: settings.privacyReadingVisible,
                })
              }
              disabled={saving === "privacy"}
              size="sm"
            >
              {saving === "privacy" ? t("saving") : tc("actions.save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* GDPR Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            📦 Data Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Download all your data in JSON format. This includes your profile, readings, journal entries, points, friends, and comments.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button
              size="sm"
              onClick={async () => {
                try {
                  const token = session?.tokens?.accessToken;
                  if (!token) return;
                  const res = await fetch("/api/users/data-export", {
                    headers: { authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `cyberfaith-data-export-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast("Data exported successfully", "success");
                  } else {
                    showToast("Failed to export data", "error");
                  }
                } catch {
                  showToast("Failed to export data", "error");
                }
              }}
            >
              Export My Data
            </Button>
            <a href="/en/privacy" className="text-sm text-primary underline hover:text-primary/80 self-center">
              Privacy Policy
            </a>
            <a href="/en/terms" className="text-sm text-primary underline hover:text-primary/80 self-center">
              Terms of Service
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Account / Danger Zone */}
      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-red-400">
            ⚠️ {t("account.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t("account.description")}</p>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            {t("account.deleteButton")}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-red-400">{t("account.confirmTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("account.confirmDescription")}</p>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              {t("account.typeToConfirm")}
            </label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              {tc("actions.back")}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE"}
              onClick={handleDeleteAccount}
            >
              {t("account.confirmDelete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
