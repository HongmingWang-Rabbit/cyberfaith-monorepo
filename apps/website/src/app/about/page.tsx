import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "CyberFaith's mission: casual spirituality for the digital generation.",
};

const team = [
  { name: "Alex Chen", role: "Founder & Visionary", emoji: "🧠" },
  { name: "Mika Tanaka", role: "Lead Developer", emoji: "⚡" },
  { name: "River Kim", role: "AI & Spirituality", emoji: "🔮" },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-24">
      {/* Mission */}
      <section className="mb-20 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">Our Mission</p>
        <h1 className="text-4xl font-bold sm:text-5xl mb-6">
          Spirituality, <span className="text-primary neon-text">Reimagined</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
          We believe self-discovery shouldn&apos;t require a monastery. CyberFaith brings ancient wisdom
          into the digital age — through AI-powered readings, personality assessments, and playful
          experiences designed for curious minds, not devoted followers.
        </p>
        <div className="mt-8 mx-auto max-w-2xl rounded-xl border border-primary/30 bg-card p-6 text-left">
          <p className="text-sm text-muted-foreground italic">
            &ldquo;We&apos;re not here to tell you what to believe. We&apos;re here to give you fun,
            modern tools to explore who you are — whether that&apos;s through MBTI,
            Tarot, the I Ching, or a game you play with friends.&rdquo;
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">What We Stand For</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: "🌐", title: "Accessible", text: "Free, fast, and available to everyone. No gatekeeping." },
            { icon: "🎭", title: "Playful", text: "Spirituality should be fun. We don't take ourselves too seriously." },
            { icon: "🔒", title: "Private", text: "Your spiritual journey is yours. We don't sell your data." },
          ].map((v) => (
            <div key={v.title} className="rounded-xl border border-border/50 bg-card p-6 text-center">
              <div className="text-3xl mb-3">{v.icon}</div>
              <h3 className="font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section>
        <h2 className="text-2xl font-bold mb-8 text-center">The Team</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {team.map((m) => (
            <div key={m.name} className="rounded-xl border border-border/50 bg-card p-6 text-center">
              <div className="text-4xl mb-3">{m.emoji}</div>
              <h3 className="font-semibold">{m.name}</h3>
              <p className="text-sm text-muted-foreground">{m.role}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
