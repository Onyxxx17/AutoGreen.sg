"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { locationFromSector, normalizeSector } from "../lib/sg-sectors";

const sectorLabel = (s: string) =>
  locationFromSector(s) ?? `Sector ${normalizeSector(s)}`;


/* ---------------- Rank chip (🏆/🥈/🥉) ---------------- */
function RankChip({ rank }: { rank: number }) {
  const styles: Record<string, { emoji: string; wrap: string }> = {
    1: { emoji: "🏆", wrap: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white ring-yellow-300" },
    2: { emoji: "🥈", wrap: "bg-gradient-to-r from-gray-400 to-gray-500 text-white ring-gray-300" },
    3: { emoji: "🥉", wrap: "bg-gradient-to-r from-amber-400 to-amber-500 text-white ring-amber-300" },
    default: { emoji: "🎖️", wrap: "bg-gray-200 text-emerald-950 ring-gray-300" },
  };
  const s = styles[rank.toString()] || styles.default;
  return (
    <span
      aria-label={`Rank ${rank}`}
      className={["rank-pop inline-flex items-center gap-1 rounded-full px-2.5 py-1", "text-sm font-semibold tabular-nums ring-1", s.wrap].join(" ")}
      style={{ animation: "rank-pop 260ms ease-out both" }}
    >
      <span className="text-base leading-none">{s.emoji}</span>
      <span>{rank}</span>
    </span>
  );
}

/* ---------------- Types & helpers ---------------- */
type ApiRow = {
  sector: string;
  total_points: number | string;
  user_count: number | string;
};


/* ---------------- In-view hook ---------------- */
function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => entry.isIntersecting && setInView(true), { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ---------------- Component ---------------- */
export default function Leaderboard() {
  const [rows, setRows] = useState<ApiRow[] | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>(0.25);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const json = await res.json();
        if (json?.success && Array.isArray(json.leaderboard)) setRows(json.leaderboard);
        else setRows([]);
      } catch {
        setRows([]);
      }
    })();
  }, []);

  // medal row glow (gold / silver / bronze)
  const rowGrad: Record<number, string> = {
    1: "from-[#F59E0B]/35 from-[12%] via-[#FDE68A]/22 via-[26%] to-transparent to-[55%]",
    2: "from-[#9CA3AF]/35 from-[10%] via-white/20    via-[24%] to-transparent to-[55%]",
    3: "from-[#B45309]/30 from-[10%] via-[#F59E0B]/16 via-[22%] to-transparent to-[55%]",
    4: "from-emerald-400/10",
    5: "from-emerald-300/8",
  };

  const top5 = useMemo(() => {
    if (!rows) return null;

    const normalized = rows.map((r) => {
      const secRaw = (r.sector ?? (r as any).sector_code ?? "00") as string;
      const sec = normalizeSector(secRaw);
      return {
        sector: sec,
        total_points:
          typeof r.total_points === "string" ? parseInt(r.total_points, 10) : (r.total_points as number),
        user_count:
          typeof r.user_count === "string" ? parseInt(r.user_count, 10) : (r.user_count as number),
      };
    });

    return normalized
      .sort((a, b) => (b.total_points ?? 0) - (a.total_points ?? 0))
      .slice(0, 5);
  }, [rows]);


  return (
    <section id="leaderboard" className="py-16 bg-white scroll-mt-24">
      <style jsx global>{`
        @keyframes lb-rise { from { opacity: 0; transform: translateY(16px);} to { opacity: 1; transform: translateY(0);} }
        @keyframes lb-sheen { from { transform: translateX(-120%);} to { transform: translateX(120%);} }
        @keyframes rank-pop { 0% { transform: scale(0.8); opacity: 0;} 100% { transform: scale(1); opacity: 1;} }
        @media (prefers-reduced-motion: reduce) { .lb-animate { animation: none !important; } }
      `}</style>

      <div className="mx-auto max-w-7xl px-4" ref={ref}>
        {/* Top band with prize image + text */}
        <div className="mb-7 rounded-3xl ring-1 ring-green-900/10 bg-gradient-to-br from-[#80c481] via-[#c7f1c7] to-[#e2ffe2] shadow-sm px-6 py-6">
        <div className="grid items-center gap-6 md:grid-cols-2 rounded-lg p-4">            
          <div className="relative h-40 md:h-56 md:pl-12">
              <Image
                src="/prize.png"
                alt="AutoGreen prize"
                width={230}
                height={20}
                priority
                className="object-contain drop-shadow-xl"
              />
            </div>
            <div className="text-emerald-950">
              <h2 className="text-2xl md:text-5xl font-semibold leading-tight">Sector Leaderboard</h2>
              <p className="mt-2 text-emerald-900/70">Top 5 sectors by verified points</p>
            </div>
          </div>
        </div>

        {/* Header row */}
        <div className="mx-2 rounded-xl bg-emerald-50/60 ring-1 ring-emerald-900/10">
          <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs font-medium uppercase tracking-wide text-black">
            <div className="col-span-2">Rank</div>
            <div className="col-span-2">Sector</div>
            <div className="col-span-4">Sector Name</div>
            <div className="col-span-2 text-right">Points</div>
            <div className="col-span-2 text-right">Users</div>
          </div>
        </div>

        {/* Rows */}
        <div className="mt-3 space-y-3">
          {!top5 &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="mx-2 h-14 rounded-xl bg-emerald-50/60 ring-1 ring-emerald-900/10 animate-pulse" />
            ))}

          {top5?.map((r, i) => {
            const rank = i + 1;
            const delay = `${i * 90}ms`;
            const isPodium = rank <= 3;
            const sectorName = locationFromSector(r.sector) ?? regionFromSector(r.sector);

            return (
              <div
                key={r.sector}
                className="relative mx-2 overflow-hidden rounded-xl bg-white/80 ring-1 ring-emerald-900/10 shadow-sm hover:shadow-md transition lb-animate"
                style={{ animation: inView ? `lb-rise 400ms ease-out ${delay} forwards` : undefined }}
              >
                <div className={`pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r ${rowGrad[rank] ?? "from-emerald-200/10"} to-transparent`} />
                {isPodium && (
                  <span
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                    style={{ animation: inView ? "lb-sheen 1100ms ease-out 180ms 1" : undefined }}
                  />
                )}

                <div className="relative grid grid-cols-12 gap-3 px-5 py-4 items-center">
                  <div className="col-span-2 flex items-center">
                    {rank <= 3 ? <RankChip rank={rank} /> : <span className="text-sm font-semibold text-emerald-950 tabular-nums">{rank}</span>}
                  </div>
                  <div className="col-span-2 text-emerald-950 font-medium">{r.sector}</div>
                  <div className="col-span-4 truncate text-emerald-900/90">
                    {sectorLabel(r.sector)}
                  </div>                  <div className="col-span-2 text-right text-emerald-950 tabular-nums font-semibold">
                    {Number(r.total_points).toLocaleString()}
                  </div>
                  <div className="col-span-2 text-right text-emerald-900/80 tabular-nums">
                    {Number(r.user_count).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}

          {top5 && top5.length === 0 && (
            <div className="mx-2 px-5 py-8 rounded-xl ring-1 ring-emerald-900/10 bg-emerald-50/70 text-sm text-emerald-900/70">
              No data yet—complete some verified green actions to populate the board.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
