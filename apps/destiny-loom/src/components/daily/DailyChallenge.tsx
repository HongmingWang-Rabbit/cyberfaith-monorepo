'use client';

import { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cyberfaith/ui';

interface DailyChallengeProps {
  className?: string;
  onComplete?: (karmaEarned: number) => void;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  karmaReward: number;
  type: 'reading' | 'arcade' | 'social' | 'spiritual';
  target: number;
  current: number;
}

const DAILY_CHALLENGES: Omit<Challenge, 'id' | 'current'>[] = [
  { title: 'Fortune Seeker', description: 'Complete 3 readings', icon: '🔮', karmaReward: 50, type: 'reading', target: 3 },
  { title: 'Arcade Master', description: 'Play 5 arcade games', icon: '🎮', karmaReward: 40, type: 'arcade', target: 5 },
  { title: 'Social Spirit', description: 'Share a reading', icon: '🔗', karmaReward: 30, type: 'social', target: 1 },
  { title: 'Daily Divination', description: 'Get your daily horoscope', icon: '⭐', karmaReward: 20, type: 'reading', target: 1 },
  { title: 'Rune Walker', description: 'Cast 3 rune readings', icon: '🪨', karmaReward: 45, type: 'reading', target: 3 },
  { title: 'Crystal Gazer', description: 'Use the crystal ball 3 times', icon: '🔮', karmaReward: 35, type: 'arcade', target: 3 },
  { title: 'Fortune Cookie Feast', description: 'Open 5 fortune cookies', icon: '🥠', karmaReward: 25, type: 'arcade', target: 5 },
  { title: 'Wheel Spinner', description: 'Spin the Destiny Wheel 3 times', icon: '🎡', karmaReward: 30, type: 'arcade', target: 3 },
  { title: 'Tarot Explorer', description: 'Complete a 3-card spread', icon: '🃏', karmaReward: 60, type: 'reading', target: 1 },
  { title: 'Mindful Moment', description: 'Complete a meditation session', icon: '🧘', karmaReward: 40, type: 'spiritual', target: 1 },
];

function getDailyChallenges(date: Date): Challenge[] {
  // Use date as seed for consistent daily challenges
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const shuffled = [...DAILY_CHALLENGES].sort((a, b) => {
    const hashA = (seed * a.karmaReward) % 1000;
    const hashB = (seed * b.karmaReward) % 1000;
    return hashA - hashB;
  });
  
  // Pick 3 challenges for the day
  return shuffled.slice(0, 3).map((c, idx) => ({
    ...c,
    id: `${seed}-${idx}`,
    current: 0,
  }));
}

export const DailyChallenge: FC<DailyChallengeProps> = ({ 
  className = '',
  onComplete,
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    // Load challenges
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    try {
      const stored = localStorage.getItem('cyberfaith_daily_challenges');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.date === todayKey) {
          setChallenges(data.challenges);
        } else {
          // New day - generate new challenges
          const newChallenges = getDailyChallenges(today);
          setChallenges(newChallenges);
          localStorage.setItem('cyberfaith_daily_challenges', JSON.stringify({
            date: todayKey,
            challenges: newChallenges,
          }));
        }
      } else {
        const newChallenges = getDailyChallenges(today);
        setChallenges(newChallenges);
        localStorage.setItem('cyberfaith_daily_challenges', JSON.stringify({
          date: todayKey,
          challenges: newChallenges,
        }));
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setChallenges(getDailyChallenges(today));
    } finally {
      setLoading(false);
    }

    // Update countdown
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalKarma = challenges.reduce((sum, c) => sum + c.karmaReward, 0);
  const earnedKarma = challenges.reduce((sum, c) => 
    c.current >= c.target ? sum + c.karmaReward : sum, 0
  );
  const completedCount = challenges.filter(c => c.current >= c.target).length;

  if (loading) {
    return (
      <Card className={`border-primary/20 ${className}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary/20 overflow-hidden ${className}`}>
      {/* Header with gradient */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-highlight" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🎯 Daily Challenges
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Resets in</p>
            <p className="text-sm font-medium text-primary">{timeUntilReset}</p>
          </div>
        </div>
        
        {/* Progress summary */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${(completedCount / challenges.length) * 100}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{challenges.length}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {challenges.map((challenge) => {
            const isComplete = challenge.current >= challenge.target;
            const progress = (challenge.current / challenge.target) * 100;

            return (
              <div
                key={challenge.id}
                className={`
                  p-3 rounded-lg transition-all duration-300
                  ${isComplete 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-muted/10 border border-muted/20'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isComplete ? 'bg-green-500/20' : 'bg-primary/10'}
                  `}>
                    <span className="text-xl">
                      {isComplete ? '✓' : challenge.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isComplete ? 'text-green-400 line-through' : 'text-foreground'}`}>
                        {challenge.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {challenge.description}
                    </p>
                    
                    {/* Progress bar */}
                    {!isComplete && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {challenge.current}/{challenge.target}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Reward */}
                  <div className={`text-right ${isComplete ? 'text-green-400' : 'text-amber-400'}`}>
                    <span className="text-sm font-bold">+{challenge.karmaReward}</span>
                    <p className="text-[10px] text-muted-foreground">karma</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total rewards */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total rewards</span>
          <div className="text-right">
            <span className="text-lg font-bold text-amber-400">{earnedKarma}</span>
            <span className="text-sm text-muted-foreground">/{totalKarma} karma</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyChallenge;
