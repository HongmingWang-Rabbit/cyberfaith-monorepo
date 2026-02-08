'use client';

import { FC, useState, useEffect } from 'react';

interface CosmicEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  date: Date;
  type: 'moon' | 'planet' | 'zodiac' | 'eclipse' | 'meteor';
}

interface CosmicEventBannerProps {
  className?: string;
}

// Sample cosmic events - would come from API
const COSMIC_EVENTS: CosmicEvent[] = [
  {
    id: '1',
    name: 'Full Moon in Virgo',
    description: 'A time for harvesting intentions and practical magic',
    icon: '🌕',
    date: new Date('2026-02-12'),
    type: 'moon',
  },
  {
    id: '2',
    name: 'Mercury Retrograde Ends',
    description: 'Communication flows freely again',
    icon: '☿️',
    date: new Date('2026-02-14'),
    type: 'planet',
  },
  {
    id: '3',
    name: 'Pisces Season Begins',
    description: 'Dive deep into intuition and dreams',
    icon: '♓',
    date: new Date('2026-02-19'),
    type: 'zodiac',
  },
];

const typeGradients: Record<string, string> = {
  moon: 'from-slate-600 via-slate-500 to-slate-600',
  planet: 'from-orange-600 via-amber-500 to-orange-600',
  zodiac: 'from-purple-600 via-pink-500 to-purple-600',
  eclipse: 'from-gray-900 via-gray-800 to-gray-900',
  meteor: 'from-cyan-600 via-blue-500 to-cyan-600',
};

export const CosmicEventBanner: FC<CosmicEventBannerProps> = ({ className = '' }) => {
  const [currentEvent, setCurrentEvent] = useState<CosmicEvent | null>(null);
  const [daysUntil, setDaysUntil] = useState(0);

  useEffect(() => {
    // Find next upcoming event
    const now = new Date();
    const upcoming = COSMIC_EVENTS
      .filter(e => new Date(e.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    if (upcoming) {
      setCurrentEvent(upcoming);
      const diff = new Date(upcoming.date).getTime() - now.getTime();
      setDaysUntil(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
  }, []);

  if (!currentEvent) return null;

  const gradient = typeGradients[currentEvent.type] || typeGradients.zodiac;

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Animated background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-90`} />
      
      {/* Stars overlay */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative px-4 py-3 flex items-center gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{currentEvent.icon}</span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white truncate">{currentEvent.name}</h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/20 text-white">
              {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
            </span>
          </div>
          <p className="text-sm text-white/80 truncate">{currentEvent.description}</p>
        </div>

        {/* CTA */}
        <button className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors flex-shrink-0">
          Learn More
        </button>
      </div>
    </div>
  );
};

export default CosmicEventBanner;
