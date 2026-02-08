'use client';

import { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cyberfaith/ui';
import { AchievementBadge } from './AchievementBadge';

type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: 'reading' | 'arcade' | 'social' | 'collector' | 'streak';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: { current: number; target: number };
}

interface AchievementsGridProps {
  className?: string;
  filter?: 'all' | 'unlocked' | 'locked';
}

const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Reading achievements
  { id: 'first-reading', name: 'Destiny Awaits', description: 'Complete your first reading', icon: '🔮', rarity: 'common', category: 'reading' },
  { id: 'tarot-initiate', name: 'Tarot Initiate', description: 'Complete 10 tarot readings', icon: '🃏', rarity: 'rare', category: 'reading', progress: { current: 0, target: 10 } },
  { id: 'tarot-master', name: 'Tarot Master', description: 'Complete 100 tarot readings', icon: '🃏', rarity: 'legendary', category: 'reading', progress: { current: 0, target: 100 } },
  { id: 'zodiac-explorer', name: 'Zodiac Explorer', description: 'Read all 12 zodiac signs', icon: '⭐', rarity: 'epic', category: 'reading', progress: { current: 0, target: 12 } },
  { id: 'iching-sage', name: 'I Ching Sage', description: 'Receive 50 I Ching readings', icon: '☯️', rarity: 'epic', category: 'reading', progress: { current: 0, target: 50 } },
  
  // Arcade achievements
  { id: 'arcade-newbie', name: 'Arcade Newbie', description: 'Play your first arcade game', icon: '🎮', rarity: 'common', category: 'arcade' },
  { id: 'lucky-wheel', name: 'Lucky Wheel', description: 'Win 10 jackpots on Destiny Wheel', icon: '🎡', rarity: 'rare', category: 'arcade', progress: { current: 0, target: 10 } },
  { id: 'fortune-addict', name: 'Fortune Addict', description: 'Open 100 fortune cookies', icon: '🥠', rarity: 'epic', category: 'arcade', progress: { current: 0, target: 100 } },
  { id: 'rune-keeper', name: 'Rune Keeper', description: 'Cast 50 rune readings', icon: '🪨', rarity: 'rare', category: 'arcade', progress: { current: 0, target: 50 } },
  { id: 'crystal-seer', name: 'Crystal Seer', description: 'Gaze into the crystal ball 25 times', icon: '🔮', rarity: 'rare', category: 'arcade', progress: { current: 0, target: 25 } },
  
  // Social achievements
  { id: 'social-butterfly', name: 'Social Butterfly', description: 'Share your first reading', icon: '🦋', rarity: 'common', category: 'social' },
  { id: 'influencer', name: 'Influencer', description: 'Share 25 readings', icon: '📣', rarity: 'epic', category: 'social', progress: { current: 0, target: 25 } },
  { id: 'gift-giver', name: 'Gift Giver', description: 'Gift a reading to a friend', icon: '🎁', rarity: 'rare', category: 'social' },
  
  // Collector achievements
  { id: 'first-mint', name: 'First Mint', description: 'Mint your first reading NFT', icon: '💎', rarity: 'rare', category: 'collector' },
  { id: 'nft-collector', name: 'NFT Collector', description: 'Mint 10 reading NFTs', icon: '🏆', rarity: 'epic', category: 'collector', progress: { current: 0, target: 10 } },
  { id: 'nft-hoarder', name: 'NFT Hoarder', description: 'Mint 50 reading NFTs', icon: '👑', rarity: 'legendary', category: 'collector', progress: { current: 0, target: 50 } },
  { id: 'mythic-collector', name: 'Mythic Collector', description: 'Collect all achievement NFTs', icon: '🌟', rarity: 'mythic', category: 'collector' },
  
  // Streak achievements
  { id: 'streak-starter', name: 'Streak Starter', description: 'Maintain a 7-day streak', icon: '🔥', rarity: 'common', category: 'streak' },
  { id: 'streak-keeper', name: 'Streak Keeper', description: 'Maintain a 30-day streak', icon: '🔥', rarity: 'rare', category: 'streak' },
  { id: 'streak-master', name: 'Streak Master', description: 'Maintain a 100-day streak', icon: '🔥', rarity: 'legendary', category: 'streak' },
  { id: 'streak-legend', name: 'Streak Legend', description: 'Maintain a 365-day streak', icon: '🔥', rarity: 'mythic', category: 'streak' },
];

const categoryIcons: Record<string, string> = {
  reading: '📖',
  arcade: '🎮',
  social: '🔗',
  collector: '💎',
  streak: '🔥',
};

export const AchievementsGrid: FC<AchievementsGridProps> = ({ 
  className = '',
  filter = 'all',
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cyberfaith_achievements');
      const unlockedIds = stored ? JSON.parse(stored) : {};
      
      const merged = ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: !!unlockedIds[a.id],
        unlockedAt: unlockedIds[a.id]?.unlockedAt,
        progress: a.progress ? {
          ...a.progress,
          current: unlockedIds[a.id]?.progress || 0,
        } : undefined,
      }));

      setAchievements(merged);
    } catch (err) {
      console.error('Failed to load achievements:', err);
      setAchievements(ACHIEVEMENTS.map(a => ({ ...a, unlocked: false })));
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  }).filter(a => {
    if (!activeCategory) return true;
    return a.category === activeCategory;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const categories = [...new Set(ACHIEVEMENTS.map(a => a.category))];

  if (loading) {
    return (
      <Card className={`border-primary/20 ${className}`}>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted/30 animate-pulse rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🏆 Achievements
            <span className="text-sm font-normal text-muted-foreground">
              ({unlockedCount}/{achievements.length})
            </span>
          </CardTitle>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              !activeCategory 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">🔒</span>
            <p className="text-muted-foreground">No achievements yet</p>
            <p className="text-sm text-muted-foreground/70">
              Start exploring to unlock achievements!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                {...achievement}
                unlockedAt={achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementsGrid;
