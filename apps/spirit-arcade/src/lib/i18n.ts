import en from "../../messages/en.json";
import zh from "../../messages/zh.json";

const messages: Record<string, typeof en> = { en, zh };

type Locale = "en" | "zh";

let currentLocale: Locale = "en";

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem("spirit-arcade-locale", locale);
  }
}

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("spirit-arcade-locale") as Locale | null;
    if (stored && messages[stored]) {
      currentLocale = stored;
    }
  }
  return currentLocale;
}

/**
 * Get a nested translation value by dot-path, e.g. "fortuneCookie.title"
 */
export function t(path: string, vars?: Record<string, string | number>): string {
  const locale = getLocale();
  const dict = messages[locale] ?? en;
  const keys = path.split(".");
  let value: unknown = dict;
  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path; // fallback to key
    }
  }
  if (typeof value !== "string") return path;
  if (vars) {
    return value.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
  }
  return value;
}
