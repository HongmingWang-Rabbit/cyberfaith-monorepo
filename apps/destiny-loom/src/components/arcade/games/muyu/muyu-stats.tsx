"use client";

interface MuyuStatsProps {
  sessionTaps: number;
  allTimeTaps: number;
  t: Record<string, string>;
}

export function MuyuStats({ sessionTaps, allTimeTaps, t }: MuyuStatsProps) {
  return (
    <div className="text-center mb-2">
      <div className="text-5xl font-light text-amber-200/90 tracking-wider mb-1" style={{ fontFamily: "serif" }}>
        {sessionTaps.toLocaleString()}
      </div>
      <div className="text-sm text-neutral-500">
        {t.allTime}: {allTimeTaps.toLocaleString()}
      </div>
    </div>
  );
}
