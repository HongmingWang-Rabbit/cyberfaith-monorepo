import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://destiny-loom.cyberfaith.app";
const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

const locales = ["en", "zh"] as const;

const staticRoutes = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/mbti", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/tarot", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/zodiac", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/i-ching", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/four-pillars", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/arcade", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/community", changeFrequency: "daily" as const, priority: 0.6 },
  { path: "/pricing", changeFrequency: "monthly" as const, priority: 0.5 },
];

const zodiacSigns = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

async function fetchPublicReadingIds(): Promise<string[]> {
  try {
    const res = await fetch(`${CORE_API_URL}/readings/feed?limit=200`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).map((r: { id: string }) => r.id);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // Static routes for each locale
  for (const locale of locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${APP_URL}/${locale}${route.path}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }

    // Zodiac sign pages
    for (const sign of zodiacSigns) {
      entries.push({
        url: `${APP_URL}/${locale}/zodiac/${sign}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.7,
      });
    }
  }

  // Public reading share pages
  const readingIds = await fetchPublicReadingIds();
  for (const locale of locales) {
    for (const id of readingIds) {
      entries.push({
        url: `${APP_URL}/${locale}/share/${id}`,
        lastModified: now,
        changeFrequency: "yearly" as const,
        priority: 0.4,
      });
    }
  }

  return entries;
}
