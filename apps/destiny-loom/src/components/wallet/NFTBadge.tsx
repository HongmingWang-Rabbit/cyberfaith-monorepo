'use client';

import { FC } from 'react';

interface NFTBadgeProps {
  minted?: boolean;
  signature?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const NFTBadge: FC<NFTBadgeProps> = ({
  minted = false,
  signature,
  className = '',
  size = 'sm',
}) => {
  if (!minted) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
          bg-muted/30 text-muted-foreground border border-muted/50
          ${size === 'md' ? 'px-3 py-1' : ''}
          ${className}`}
        title="Not minted as NFT"
      >
        <span className="opacity-50">🎴</span>
        <span className="hidden sm:inline">Not minted</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
        bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30
        ${size === 'md' ? 'px-3 py-1' : ''}
        ${className}`}
      title={signature ? `NFT: ${signature}` : 'Minted as NFT'}
    >
      <span>✨</span>
      <span className="hidden sm:inline">NFT</span>
    </span>
  );
};

export default NFTBadge;
