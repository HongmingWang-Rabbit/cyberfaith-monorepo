'use client';

import { FC } from 'react';

type ReadingType = 'tarot' | 'zodiac' | 'mbti' | 'iching' | 'four-pillars' | 'dream' | 'numerology';

interface ReadingTypeBadgeProps {
  type: ReadingType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const typeConfig: Record<ReadingType, { icon: string; label: string; color: string }> = {
  tarot: { icon: '🃏', label: 'Tarot', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-300' },
  zodiac: { icon: '⭐', label: 'Zodiac', color: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-300' },
  mbti: { icon: '🧠', label: 'MBTI', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300' },
  iching: { icon: '☯️', label: 'I Ching', color: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-300' },
  'four-pillars': { icon: '🏛️', label: 'Four Pillars', color: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-300' },
  dream: { icon: '🌙', label: 'Dream', color: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 text-indigo-300' },
  numerology: { icon: '🔢', label: 'Numerology', color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-300' },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-2 gap-2',
};

const iconSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

export const ReadingTypeBadge: FC<ReadingTypeBadgeProps> = ({
  type,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const config = typeConfig[type] || typeConfig.tarot;

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        bg-gradient-to-r ${config.color} border
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <span className={iconSizes[size]}>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

export default ReadingTypeBadge;
