'use client';

import { FC } from 'react';
import { Card, CardContent } from '@cyberfaith/ui';
import { ShareButtons } from '@/components/social';

type ReadingType = 'tarot' | 'zodiac' | 'mbti' | 'iching' | 'four-pillars' | 'dream' | 'numerology';

interface ReadingCardProps {
  id: string;
  type: ReadingType;
  title: string;
  summary: string;
  date: Date;
  isPublic?: boolean;
  nftMinted?: boolean;
  className?: string;
  onShare?: () => void;
  onMint?: () => void;
}

const typeConfig: Record<ReadingType, { icon: string; gradient: string }> = {
  tarot: { icon: '🃏', gradient: 'from-purple-500/20 to-purple-600/20' },
  zodiac: { icon: '⭐', gradient: 'from-pink-500/20 to-pink-600/20' },
  mbti: { icon: '🧠', gradient: 'from-blue-500/20 to-blue-600/20' },
  iching: { icon: '☯️', gradient: 'from-cyan-500/20 to-cyan-600/20' },
  'four-pillars': { icon: '🏛️', gradient: 'from-amber-500/20 to-amber-600/20' },
  dream: { icon: '🌙', gradient: 'from-indigo-500/20 to-indigo-600/20' },
  numerology: { icon: '🔢', gradient: 'from-emerald-500/20 to-emerald-600/20' },
};

const typeLabels: Record<ReadingType, string> = {
  tarot: 'Tarot',
  zodiac: 'Zodiac',
  mbti: 'MBTI',
  iching: 'I Ching',
  'four-pillars': 'Four Pillars',
  dream: 'Dream',
  numerology: 'Numerology',
};

export const ReadingCard: FC<ReadingCardProps> = ({
  id,
  type,
  title,
  summary,
  date,
  isPublic = false,
  nftMinted = false,
  className = '',
  onShare,
  onMint,
}) => {
  const config = typeConfig[type] || typeConfig.tarot;
  
  const formatDate = (d: Date) => {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/reading/${id}` 
    : '';

  return (
    <Card className={`border-primary/20 overflow-hidden ${className}`}>
      {/* Type gradient header */}
      <div className={`h-1 bg-gradient-to-r ${config.gradient.replace('/20', '')}`} />
      
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Type icon */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
            <span className="text-2xl">{config.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground truncate">{title}</h3>
              {nftMinted && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  NFT
                </span>
              )}
              {isPublic && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-green-500/20 text-green-400 border border-green-500/30">
                  Public
                </span>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {summary}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${config.gradient}`}>
                  {typeLabels[type]}
                </span>
                <span>•</span>
                <span>{formatDate(date)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {!nftMinted && onMint && (
                  <button
                    onClick={onMint}
                    className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors text-muted-foreground hover:text-cyan-400"
                    title="Mint as NFT"
                  >
                    💎
                  </button>
                )}
                {isPublic && shareUrl && (
                  <ShareButtons 
                    url={shareUrl} 
                    title={title} 
                    text={summary}
                    className="scale-75 origin-right"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadingCard;
