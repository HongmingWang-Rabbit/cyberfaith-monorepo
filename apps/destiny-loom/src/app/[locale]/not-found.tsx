import Link from "next/link";

const SPIRITUAL_MESSAGES = [
  "The cards reveal... this page exists in another dimension. 🃏",
  "Your birth chart shows no alignment with this URL. ♈",
  "The I Ching hexagram for this page: ☰ — The Creative Void. 📖",
  "Mercury retrograde strikes again — this path leads nowhere. 🪐",
  "The tea leaves say: wrong turn, but the journey continues. 🍵",
];

export default function LocaleNotFound() {
  // Pick a deterministic-ish message based on current minute
  const message = SPIRITUAL_MESSAGES[new Date().getMinutes() % SPIRITUAL_MESSAGES.length];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="relative">
        <span className="text-8xl block animate-bounce" style={{ animationDuration: "2s" }}>
          🔮
        </span>
        <span className="absolute -top-2 -right-4 text-3xl animate-pulse">💫</span>
      </div>
      <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
        404
      </h1>
      <p className="text-lg text-muted-foreground max-w-md">{message}</p>
      <Link
        href="/"
        className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-medium hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all duration-300 hover:scale-105 active:scale-95"
      >
        ✨ Back to Destiny Loom
      </Link>
    </div>
  );
}
