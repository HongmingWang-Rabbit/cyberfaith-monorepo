export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] text-white min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 p-8 max-w-lg">
          <div className="text-8xl animate-pulse">🌌</div>
          <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-xl text-gray-300">
            This page has drifted beyond the astral plane
          </p>
          <p className="text-sm text-gray-500">
            Even the stars couldn&apos;t find what you&apos;re looking for.
            <br />
            Perhaps Mercury is in retrograde... again. 🪐
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-medium hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all duration-300 hover:scale-105"
          >
            ✨ Return to the Known Universe
          </a>
        </div>
      </body>
    </html>
  );
}
