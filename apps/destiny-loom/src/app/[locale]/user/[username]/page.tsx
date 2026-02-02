import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProfileFollowButton, ProfileReportButton, ProfileBadges } from "./client-parts";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const zodiacEmoji: Record<string, string> = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};

const typeIcons: Record<string, string> = {
  mbti: "🧠", tarot: "🃏", "i-ching": "☯️", "four-pillars": "🏛️", zodiac: "⭐", dream: "🌙",
};

interface ProfileData {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  zodiacSign: string | null;
  karma: number;
  readingCount: number;
  followerCount: number;
  followingCount: number;
  achievements: { name: string; description: string; icon: string | null; category: string | null; unlockedAt: string }[];
  recentReadings: { id: string; type: string; result: any; createdAt: string }[];
  joinDate: string;
  id?: string;
}

async function fetchProfile(username: string): Promise<ProfileData | null> {
  try {
    const res = await fetch(`${CORE_API_URL}/users/profile/${username}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ username: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchProfile(username);

  if (!profile) return { title: "User Not Found — Destiny Loom" };

  const title = `${profile.displayName} (@${username})`;
  const description = `${profile.readingCount} readings · ${profile.karma} karma${profile.zodiacSign ? ` · ${profile.zodiacSign}` : ""}`;
  const ogImageUrl = `${APP_URL}/api/og/profile/${username}`;

  return {
    title: `${title} — Destiny Loom`,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${APP_URL}/user/${username}`,
      siteName: "Destiny Loom — CyberFaith",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username, locale } = await params;
  const profile = await fetchProfile(username);

  if (!profile) notFound();

  const joinDate = new Date(profile.joinDate).toLocaleDateString("en-US", {
    year: "numeric", month: "long",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Profile card */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="relative p-8 space-y-6">
            {/* Avatar + name */}
            <div className="flex flex-col items-center space-y-3">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-24 h-24 rounded-full border-2 border-primary/30 shadow-lg shadow-primary/20" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl shadow-lg shadow-primary/20">
                  👤
                </div>
              )}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 justify-center">
                  {profile.displayName}
                  {profile.zodiacSign && (
                    <span className="text-xl" title={profile.zodiacSign}>
                      {zodiacEmoji[profile.zodiacSign] || ""}
                    </span>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                <p className="text-xs text-muted-foreground mt-1">Joined {joinDate}</p>
              </div>
              {/* Follow + Report */}
              <div className="flex items-center gap-2 justify-center">
                {profile.id && <ProfileFollowButton userId={profile.id} />}
                {profile.id && <ProfileReportButton userId={profile.id} />}
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{profile.karma.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Karma</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{profile.readingCount}</div>
                <div className="text-xs text-muted-foreground">Readings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-highlight">{profile.achievements.length}</div>
                <div className="text-xs text-muted-foreground">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{profile.followerCount}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{profile.followingCount}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>

            {/* Achievements */}
            {profile.achievements.length > 0 && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Achievements</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.achievements.map((a, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                        title={a.description}
                      >
                        {a.icon && <span>{a.icon}</span>}
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Badges */}
            {profile.id && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <ProfileBadges userId={profile.id} />
              </>
            )}

            {/* Recent readings */}
            {profile.recentReadings.length > 0 && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Public Readings</h2>
                  <div className="space-y-2">
                    {profile.recentReadings.map((r) => (
                      <Link
                        key={r.id}
                        href={`/${locale}/share/${r.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition"
                      >
                        <span className="text-lg">{typeIcons[r.type] || "✨"}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground capitalize">{r.type.replace("-", " ")}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all"
          >
            🔮 Discover Your Destiny
          </Link>
        </div>
      </div>
    </div>
  );
}
