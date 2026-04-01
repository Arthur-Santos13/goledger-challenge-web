import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-32 overflow-hidden">
        {/* layered gradient: Netflix black → Letterboxd slate */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1117] via-[#141414] to-[#1c2228]" />
        {/* red glow accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
          {/* wordmark only — no N logo */}
          <p className="text-[#7C3AED] text-xs font-bold tracking-[0.35em] uppercase">FlixDB — Blockchain Catalogue</p>

          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tight">
            Discover &amp; catalogue<br />
            <span className="text-[#7C3AED]">TV Shows</span>
          </h1>

          <p className="text-[#8899aa] text-lg max-w-xl">
            A blockchain-powered catalogue. Browse series, seasons and episodes — or build your personal watchlist.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <Link
              href="/tv-shows"
              className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-md transition-colors duration-150 text-sm"
            >
              Browse TV Shows
            </Link>
            <Link
              href="/watchlist"
              className="px-6 py-3 bg-[#2c3440] hover:bg-[#445566] text-white font-semibold rounded-md transition-colors duration-150 text-sm border border-[#445566]"
            >
              My Watchlist
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards — TV Shows + Watchlist only */}
      <section className="bg-[#0f1117] px-4 py-16">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'TV Shows', desc: 'Add, edit and explore every series in the blockchain registry.', href: '/tv-shows', accent: '#7C3AED' },
            { title: 'Watchlist', desc: 'Curate personal lists of series you want to watch or have watched.', href: '/watchlist', accent: '#445566' },
          ].map(({ title, desc, href, accent }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col gap-3 p-6 rounded-lg bg-[#1c2228] hover:bg-[#2c3440] border border-[#2c3440] hover:border-[#445566] transition-all duration-200"
            >
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: accent }} />
              <h2 className="text-white font-bold text-lg group-hover:text-[#7C3AED] transition-colors duration-150">{title}</h2>
              <p className="text-[#8899aa] text-sm leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
