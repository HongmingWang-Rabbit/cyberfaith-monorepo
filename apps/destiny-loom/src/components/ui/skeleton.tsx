'use client';

import { FC } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'text' ? '1em' : undefined),
  };

  return (
    <>
      <div
        className={`
          bg-muted/30 
          ${variantClasses[variant]} 
          ${animationClasses[animation]}
          ${className}
        `}
        style={style}
      />
      {animation === 'wave' && (
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            background: linear-gradient(
              90deg,
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,0.05) 50%,
              rgba(255,255,255,0) 100%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
        `}</style>
      )}
    </>
  );
};

// Preset skeleton components
export const SkeletonText: FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        variant="text" 
        width={i === lines - 1 ? '60%' : '100%'} 
        height="0.875rem"
      />
    ))}
  </div>
);

export const SkeletonCard: FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 rounded-xl border border-muted/20 ${className}`}>
    <div className="flex gap-3">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" height="1rem" />
        <Skeleton variant="text" width="70%" height="0.75rem" />
      </div>
    </div>
    <div className="mt-4">
      <SkeletonText lines={2} />
    </div>
  </div>
);

export const SkeletonAvatar: FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = '' 
}) => (
  <Skeleton 
    variant="circular" 
    width={size} 
    height={size} 
    className={className}
  />
);

export default Skeleton;
