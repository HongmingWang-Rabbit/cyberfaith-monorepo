'use client';

import { FC, useState, useEffect } from 'react';
import { Card, CardContent } from '@cyberfaith/ui';

interface KarmaTrackerProps {
  className?: string;
  showBreakdown?: boolean;
}

interface KarmaData {
  total: number;
  breakdown: {
    readings: number;
    arcade: number;
    nfts: number;
    streaks: number;
    referrals: number;
  };
  level: number;
  nextLevelAt: number;
}

const levelTitles = [
  'Seeker',
  'Initiate',
  'Acolyte',
  'Mystic',
  'Oracle',
  'Sage',
  'Elder',
  'Ascended',
  'Enlightened',
  'Cosmic',
];

const levelColors = [
  'from-gray-400 to-gray-500',
  'from-green-400 to-green-500',
  'from-blue-400 to-blue-500',
  'from-purple-400 to-purple-500',
  'from-pink-400 to-pink-500',
  'from-amber-400 to-amber-500',
  'from-cyan-400 to-cyan-500',
  'from-rose-400 to-rose-500',
  'from-violet-400 to-violet-500',
  'from-yellow-400 via-orange-400 to-red-400',
];

export const KarmaTracker: FC<KarmaTrackerProps> = ({ 
  className = '',
  showBreakdown = false,
}) => {
  const [karma, setKarma] = useState<KarmaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cyberfaith_karma');
      if (stored) {
        setKarma(JSON.parse(stored));
      } else {
        // Default karma data
        setKarma({
          total: 0,
          breakdown: {
            readings: 0,
            arcade: 0,
            nfts: 0,
            streaks: 0,
            referrals: 0,
          },
          level: 0,
          nextLevelAt: 100,
        });
      }
    } catch (err) {
      console.error('Failed to load karma:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading || !karma) {
    return (
      <Card className={`border-primary/20 ${className}`}>
        <CardContent className="p-4">
          <div className="h-20 bg-muted/30 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const level = Math.min(karma.level, levelTitles.length - 1);
  const progress = karma.nextLevelAt > 0 
    ? ((karma.total % 100) / karma.nextLevelAt) * 100 
    : 100;

  return (
    <Card className={`border-primary/20 overflow-hidden ${className}`}>
      {/* Gradient header */}
      <div className={`h-2 bg-gradient-to-r ${levelColors[level]}`} />
      
      <CardContent className="p-4">
        {/* Main karma display */}
        <div className="flex items-center gap-4">
          {/* Level badge */}
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${levelColors[level]} flex items-center justify-center shadow-lg`}>
            <span className="text-2xl font-bold text-white">{level}</span>
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {karma.total.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">karma</span>
            </div>
            <p className={`text-sm font-medium bg-gradient-to-r ${levelColors[level]} bg-clip-text text-transparent`}>
              {levelTitles[level]}
            </p>
          </div>

          {/* Progress to next level */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Next level</p>
            <p className="text-sm font-medium text-foreground">
              {karma.nextLevelAt - (karma.total % 100)} pts
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${levelColors[level]} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Breakdown */}
        {showBreakdown && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Karma Sources</p>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div>
                <p className="text-sm font-bold text-purple-400">{karma.breakdown.readings}</p>
                <p className="text-[10px] text-muted-foreground">Readings</p>
              </div>
              <div>
                <p className="text-sm font-bold text-pink-400">{karma.breakdown.arcade}</p>
                <p className="text-[10px] text-muted-foreground">Arcade</p>
              </div>
              <div>
                <p className="text-sm font-bold text-cyan-400">{karma.breakdown.nfts}</p>
                <p className="text-[10px] text-muted-foreground">NFTs</p>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-400">{karma.breakdown.streaks}</p>
                <p className="text-[10px] text-muted-foreground">Streaks</p>
              </div>
              <div>
                <p className="text-sm font-bold text-green-400">{karma.breakdown.referrals}</p>
                <p className="text-[10px] text-muted-foreground">Referrals</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KarmaTracker;
