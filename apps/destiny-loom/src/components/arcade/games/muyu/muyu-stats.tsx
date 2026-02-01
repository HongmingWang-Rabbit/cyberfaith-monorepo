"use client";

interface MuyuStatsProps {
  sessionTaps: number;
  allTimeTaps: number;
  tps: number;
  streakDays: number;
  nextPointAt: number;
  t: Record<string, string>;
}

export function MuyuStats({ sessionTaps, allTimeTaps, tps, streakDays, nextPointAt, t }: MuyuStatsProps) {
  const progressToNext = nextPointAt > 0 ? ((allTimeTaps % 100) / 100) * 100 : 0;

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      <StatCard label={t.session} value={sessionTaps.toLocaleString()} color="text-cyan-400" />
      <StatCard label={t.allTime} value={allTimeTaps.toLocaleString()} color="text-amber-400" />
      <StatCard label={t.tps} value={tps.toString()} color="text-purple-400" />
      <StatCard label={t.streak} value={`${streakDays} ${t.days}`} color="text-green-400" />

      {/* Progress bar to next point */}
      <div className="col-span-4 mt-1">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{t.nextPoint} {nextPointAt.toLocaleString()} {t.taps}</span>
          <span>{Math.round(progressToNext)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progressToNext}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center p-2 rounded-xl bg-gray-900/60 border border-gray-800">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
