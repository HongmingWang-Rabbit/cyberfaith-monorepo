'use client';

import { FC } from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  variant?: 'fullscreen' | 'container' | 'inline';
  className?: string;
}

const spinnerVariants = [
  '🔮', '✨', '🌟', '💫', '⭐', '🌙', '☀️', '🌀'
];

export const LoadingOverlay: FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  variant = 'fullscreen',
  className = '',
}) => {
  if (!isLoading) return null;

  const randomSpinner = spinnerVariants[Math.floor(Math.random() * spinnerVariants.length)];

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xl animate-spin">{randomSpinner}</span>
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    );
  }

  const containerClass = variant === 'fullscreen' 
    ? 'fixed inset-0 z-50' 
    : 'absolute inset-0 z-10';

  return (
    <div className={`${containerClass} flex items-center justify-center bg-background/80 backdrop-blur-sm ${className}`}>
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl animate-pulse">{randomSpinner}</span>
          </div>
        </div>

        {/* Message */}
        <p className="text-muted-foreground animate-pulse">{message}</p>

        {/* Mystical dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              style={{
                animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Reading-specific loading messages
export const ReadingLoadingOverlay: FC<{ isLoading: boolean }> = ({ isLoading }) => {
  const messages = [
    'Consulting the cosmos...',
    'Reading the stars...',
    'Channeling divine wisdom...',
    'The cards are speaking...',
    'Aligning the energies...',
    'Unveiling your destiny...',
  ];
  
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  return <LoadingOverlay isLoading={isLoading} message={message} />;
};

// Minting-specific loading
export const MintingLoadingOverlay: FC<{ isLoading: boolean; step?: string }> = ({ 
  isLoading, 
  step = 'Preparing transaction...' 
}) => {
  return <LoadingOverlay isLoading={isLoading} message={step} />;
};

export default LoadingOverlay;
