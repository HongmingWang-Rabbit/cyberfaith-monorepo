'use client';

import { FC } from 'react';

type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

interface AchievementBadgeProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: { current: number; target: number };
  className?: string;
}

const rarityConfig: Record<AchievementRarity, { 
  gradient: string; 
  border: string; 
  glow: string;
  label: string;
}> = {
  common: {
    gradient: 'from-gray-400 to-gray-500',
    border: 'border-gray-500/50',
    glow: 'shadow-gray-500/20',
    label: 'Common',
  },
  rare: {
    gradient: 'from-blue-400 to-blue-500',
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/30',
    label: 'Rare',
  },
  epic: {
    gradient: 'from-purple-400 to-purple-500',
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/40',
    label: 'Epic',
  },
  legendary: {
    gradient: 'from-amber-400 to-orange-500',
    border: 'border-amber-500/50',
    glow: 'shadow-amber-500/50',
    label: 'Legendary',
  },
  mythic: {
    gradient: 'from-pink-400 via-purple-400 to-cyan-400',
    border: 'border-pink-500/50',
    glow: 'shadow-pink-500/50',
    label: 'Mythic',
  },
};

export const AchievementBadge: FC<AchievementBadgeProps> = ({
  name,
  description,
  icon,
  rarity,
  unlocked,
  unlockedAt,
  progress,
  className = '',
}) => {
  const config = rarityConfig[rarity];

  return (
    <div 
      className={`
        relative p-4 rounded-xl border transition-all duration-300
        ${unlocked 
          ? `bg-gradient-to-br ${config.gradient}/10 ${config.border} shadow-lg ${config.glow}` 
          : 'bg-muted/10 border-muted/30 opacity-60'
        }
        ${className}
      `}
    >
      {/* Rarity indicator */}
      <div className={`
        absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold
        ${unlocked 
          ? `bg-gradient-to-r ${config.gradient} text-white` 
          : 'bg-muted text-muted-foreground'
        }
      `}>
        {config.label}
      </div>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center
          ${unlocked 
            ? `bg-gradient-to-br ${config.gradient}` 
            : 'bg-muted/30'
          }
        `}>
          <span className={`text-2xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
            {icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
            {name}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {description}
          </p>

          {/* Progress bar (if not unlocked) */}
          {!unlocked && progress && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-300`}
                  style={{ width: `${(progress.current / progress.target) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {progress.current}/{progress.target}
              </span>
            </div>
          )}

          {/* Unlocked date */}
          {unlocked && unlockedAt && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Shine effect for unlocked */}
      {unlocked && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AchievementBadge;
