'use client';

import { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cyberfaith/ui';
import { NFTBadge } from '@/components/wallet';

type ReadingType = 'tarot' | 'zodiac' | 'mbti' | 'iching' | 'four-pillars' | 'fortune-cookie' | 'destiny-wheel';

interface ReadingRecord {
  id: string;
  type: ReadingType;
  title: string;
  summary: string;
  date: Date;
  nftMinted: boolean;
  nftSignature?: string;
}

interface ReadingHistoryProps {
  className?: string;
  limit?: number;
}

const typeIcons: Record<ReadingType, string> = {
  tarot: '🃏',
  zodiac: '⭐',
  mbti: '🧠',
  iching: '☯️',
  'four-pillars': '🏛️',
  'fortune-cookie': '🥠',
  'destiny-wheel': '🎡',
};

const typeLabels: Record<ReadingType, string> = {
  tarot: 'Tarot',
  zodiac: 'Zodiac',
  mbti: 'MBTI',
  iching: 'I Ching',
  'four-pillars': 'Four Pillars',
  'fortune-cookie': 'Fortune Cookie',
  'destiny-wheel': 'Destiny Wheel',
};

export const ReadingHistory: FC<ReadingHistoryProps> = ({ 
  className = '',
  limit = 10,
}) => {
  const [readings, setReadings] = useState<ReadingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage for now (can be replaced with API)
    try {
      const stored = localStorage.getItem('cyberfaith_readings');
      if (stored) {
        const parsed = JSON.parse(stored) as ReadingRecord[];
        setReadings(parsed.slice(0, limit));
      }
    } catch (err) {
      console.error('Failed to load reading history:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card className={`border-primary/20 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg">Reading History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (readings.length === 0) {
    return (
      <Card className={`border-primary/20 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg">Reading History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">🔮</span>
            <p className="text-muted-foreground">No readings yet</p>
            <p className="text-sm text-muted-foreground/70">
              Your mystical journey awaits...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          📜 Reading History
          <span className="text-sm font-normal text-muted-foreground">
            ({readings.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {readings.map((reading) => (
            <div
              key={reading.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
            >
              {/* Type icon */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{typeIcons[reading.type]}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">
                    {reading.title}
                  </span>
                  {reading.nftMinted && (
                    <NFTBadge signature={reading.nftSignature} size="sm" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {reading.summary}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground/70">
                    {typeLabels[reading.type]}
                  </span>
                  <span className="text-xs text-muted-foreground/50">•</span>
                  <span className="text-xs text-muted-foreground/70">
                    {formatDate(reading.date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {readings.length >= limit && (
          <button className="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors">
            View all readings →
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadingHistory;
