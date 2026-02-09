'use client';

import { FC, useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
  onComplete?: () => void;
  variant?: 'large' | 'compact' | 'inline';
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    total: diff,
  };
};

export const CountdownTimer: FC<CountdownTimerProps> = ({
  targetDate,
  title,
  onComplete,
  variant = 'large',
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0 && !completed) {
        setCompleted(true);
        onComplete?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete, completed]);

  if (variant === 'inline') {
    return (
      <span className={`font-mono ${className}`}>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {title && <span className="text-sm text-muted-foreground">{title}</span>}
        <div className="flex gap-1 font-mono text-sm">
          <span className="px-2 py-1 rounded bg-muted/30">{timeLeft.days}d</span>
          <span className="px-2 py-1 rounded bg-muted/30">{timeLeft.hours}h</span>
          <span className="px-2 py-1 rounded bg-muted/30">{timeLeft.minutes}m</span>
          <span className="px-2 py-1 rounded bg-muted/30 text-primary">{timeLeft.seconds}s</span>
        </div>
      </div>
    );
  }

  // Large variant (default)
  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className={`text-center ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-muted-foreground mb-4">{title}</h3>
      )}
      
      <div className="flex justify-center gap-4">
        {timeUnits.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground font-mono">
                {value.toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs text-muted-foreground mt-1">{label}</span>
          </div>
        ))}
      </div>

      {completed && (
        <p className="mt-4 text-green-400 font-medium animate-pulse">
          🎉 Time's up!
        </p>
      )}
    </div>
  );
};

export default CountdownTimer;
