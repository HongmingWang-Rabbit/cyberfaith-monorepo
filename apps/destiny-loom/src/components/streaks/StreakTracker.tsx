'use client';

import { FC, useState, useEffect } from 'react';

interface StreakTrackerProps {
  className?: string;
  variant?: 'compact' | 'full';
}

interface StreakData {
  current: number;
  longest: number;
  lastActive: string; // ISO date
  weekActivity: boolean[]; // Last 7 days, index 0 = today
}

const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365];

export const StreakTracker: FC<StreakTrackerProps> = ({ 
  className = '',
  variant = 'full',
}) => {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cyberfaith_streak');
      if (stored) {
        const data = JSON.parse(stored) as StreakData;
        
        // Check if streak is still active (within 24h of last activity)
        const lastActive = new Date(data.lastActive);
        const now = new Date();
        const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceActive > 48) {
          // Streak broken - reset
          setStreak({
            current: 0,
            longest: data.longest,
            lastActive: now.toISOString(),
            weekActivity: [false, false, false, false, false, false, false],
          });
        } else {
          setStreak(data);
        }
      } else {
        // Initialize new streak data
        setStreak({
          current: 0,
          longest: 0,
          lastActive: new Date().toISOString(),
          weekActivity: [false, false, false, false, false, false, false],
        });
      }
    } catch (err) {
      console.error('Failed to load streak:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFlameEmoji = (count: number) => {
    if (count >= 100) return '🔥🔥🔥';
    if (count >= 30) return '🔥🔥';
    if (count >= 7) return '🔥';
    return '✨';
  };

  const getNextMilestone = (current: number) => {
    return STREAK_MILESTONES.find(m => m > current) || current;
  };

  if (loading || !streak) {
    return (
      <div className={`h-16 bg-muted/30 animate-pulse rounded-lg ${className}`} />
    );
  }

  const nextMilestone = getNextMilestone(streak.current);
  const progress = (streak.current / nextMilestone) * 100;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xl">{getFlameEmoji(streak.current)}</span>
        <span className="font-bold text-foreground">{streak.current}</span>
        <span className="text-sm text-muted-foreground">day streak</span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 ${className}`}>
      {/* Main streak display */}
      <div className="flex items-center gap-4">
        {/* Flame icon */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
          <span className="text-2xl">{getFlameEmoji(streak.current)}</span>
        </div>

        {/* Stats */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {streak.current}
            </span>
            <span className="text-sm text-muted-foreground">day streak</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Best: {streak.longest} days
          </p>
        </div>

        {/* Next milestone */}
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Next milestone</p>
          <p className="text-lg font-bold text-orange-400">{nextMilestone}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-muted/30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Week activity */}
      <div className="mt-4 flex justify-between">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
          const isActive = streak.weekActivity[6 - idx]; // Reverse order
          const isToday = idx === new Date().getDay();
          
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{day}</span>
              <div 
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs
                  ${isActive 
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' 
                    : 'bg-muted/30 text-muted-foreground'
                  }
                  ${isToday ? 'ring-2 ring-orange-500/50 ring-offset-2 ring-offset-background' : ''}
                `}
              >
                {isActive ? '✓' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational message */}
      {streak.current > 0 && (
        <p className="mt-3 text-center text-sm text-orange-300/80">
          {streak.current >= 30 
            ? "🌟 Legendary dedication! You're on fire!"
            : streak.current >= 7 
              ? "🔥 Amazing! Keep the momentum going!"
              : "✨ Great start! Build that streak!"}
        </p>
      )}
    </div>
  );
};

export default StreakTracker;
