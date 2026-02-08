'use client';

import { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cyberfaith/ui';

type LeaderboardType = 'karma' | 'streak' | 'nfts' | 'readings';

interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName?: string;
  avatar?: string;
  value: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  className?: string;
  defaultType?: LeaderboardType;
}

const typeConfig: Record<LeaderboardType, { label: string; icon: string; suffix: string }> = {
  karma: { label: 'Top Karma', icon: '⭐', suffix: 'pts' },
  streak: { label: 'Longest Streaks', icon: '🔥', suffix: 'days' },
  nfts: { label: 'NFT Collectors', icon: '💎', suffix: 'NFTs' },
  readings: { label: 'Most Readings', icon: '🔮', suffix: 'readings' },
};

// Mock data - would come from API
const MOCK_LEADERBOARD: Record<LeaderboardType, LeaderboardEntry[]> = {
  karma: [
    { rank: 1, address: '7xKXt...8mNq', displayName: 'CosmicSeer', value: 12450 },
    { rank: 2, address: '3pRVt...2kLm', displayName: 'MysticOne', value: 9870 },
    { rank: 3, address: '9wQZr...5jHn', displayName: 'StarGazer', value: 8340 },
    { rank: 4, address: '2nMKp...7vBc', displayName: 'OracleX', value: 7210 },
    { rank: 5, address: '5tYUi...3wDf', displayName: 'FateWeaver', value: 6890 },
    { rank: 6, address: '8kLPo...9xRt', displayName: 'MoonChild', value: 5670 },
    { rank: 7, address: '1qAZx...4sCv', displayName: 'TarotPro', value: 4320 },
    { rank: 8, address: '6yHNm...0pWq', displayName: 'ZodiacKing', value: 3980 },
    { rank: 9, address: '4rFGb...6nJk', displayName: 'RuneMaster', value: 3450 },
    { rank: 10, address: '0sDEw...1mLo', displayName: 'CrystalEye', value: 2890 },
  ],
  streak: [
    { rank: 1, address: '7xKXt...8mNq', displayName: 'CosmicSeer', value: 156 },
    { rank: 2, address: '9wQZr...5jHn', displayName: 'StarGazer', value: 98 },
    { rank: 3, address: '3pRVt...2kLm', displayName: 'MysticOne', value: 87 },
    { rank: 4, address: '5tYUi...3wDf', displayName: 'FateWeaver', value: 64 },
    { rank: 5, address: '2nMKp...7vBc', displayName: 'OracleX', value: 52 },
  ],
  nfts: [
    { rank: 1, address: '3pRVt...2kLm', displayName: 'MysticOne', value: 47 },
    { rank: 2, address: '7xKXt...8mNq', displayName: 'CosmicSeer', value: 38 },
    { rank: 3, address: '2nMKp...7vBc', displayName: 'OracleX', value: 29 },
    { rank: 4, address: '9wQZr...5jHn', displayName: 'StarGazer', value: 24 },
    { rank: 5, address: '8kLPo...9xRt', displayName: 'MoonChild', value: 18 },
  ],
  readings: [
    { rank: 1, address: '7xKXt...8mNq', displayName: 'CosmicSeer', value: 342 },
    { rank: 2, address: '3pRVt...2kLm', displayName: 'MysticOne', value: 287 },
    { rank: 3, address: '9wQZr...5jHn', displayName: 'StarGazer', value: 234 },
    { rank: 4, address: '5tYUi...3wDf', displayName: 'FateWeaver', value: 198 },
    { rank: 5, address: '2nMKp...7vBc', displayName: 'OracleX', value: 176 },
  ],
};

const rankColors = ['text-amber-400', 'text-gray-300', 'text-amber-600'];
const rankIcons = ['🥇', '🥈', '🥉'];

export const Leaderboard: FC<LeaderboardProps> = ({ 
  className = '',
  defaultType = 'karma',
}) => {
  const [activeType, setActiveType] = useState<LeaderboardType>(defaultType);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setEntries(MOCK_LEADERBOARD[activeType]);
      setLoading(false);
    }, 300);
  }, [activeType]);

  const config = typeConfig[activeType];

  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          🏅 Leaderboard
        </CardTitle>

        {/* Type tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {(Object.keys(typeConfig) as LeaderboardType[]).map((type) => {
            const tc = typeConfig[type];
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeType === type
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {tc.icon} {tc.label}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.rank}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-colors
                  ${entry.isCurrentUser 
                    ? 'bg-primary/10 border border-primary/30' 
                    : 'bg-muted/10 hover:bg-muted/20'
                  }
                `}
              >
                {/* Rank */}
                <div className={`w-8 text-center font-bold ${rankColors[entry.rank - 1] || 'text-muted-foreground'}`}>
                  {entry.rank <= 3 ? rankIcons[entry.rank - 1] : `#${entry.rank}`}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  {entry.avatar ? (
                    <img src={entry.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-lg">
                      {entry.displayName?.[0] || '?'}
                    </span>
                  )}
                </div>

                {/* Name & address */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {entry.displayName || entry.address}
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-xs text-primary">(You)</span>
                    )}
                  </p>
                  {entry.displayName && (
                    <p className="text-xs text-muted-foreground">{entry.address}</p>
                  )}
                </div>

                {/* Value */}
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    {entry.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{config.suffix}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View more */}
        <button className="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors">
          View full leaderboard →
        </button>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
