'use client';

import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Card, CardContent } from '@cyberfaith/ui';

interface WalletConnectPromptProps {
  className?: string;
  variant?: 'card' | 'inline' | 'banner';
  title?: string;
  description?: string;
  benefits?: string[];
}

const defaultBenefits = [
  'Mint readings as NFTs',
  'Earn on-chain karma',
  'Access exclusive features',
  'Join the leaderboard',
];

export const WalletConnectPrompt: FC<WalletConnectPromptProps> = ({
  className = '',
  variant = 'card',
  title = 'Connect Your Wallet',
  description = 'Unlock the full CyberFaith experience',
  benefits = defaultBenefits,
}) => {
  const { connected, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected) return null;

  const handleConnect = () => {
    setVisible(true);
  };

  if (variant === 'inline') {
    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all
          bg-gradient-to-r from-purple-600 to-pink-600 
          hover:from-purple-500 hover:to-pink-500
          text-white shadow-lg hover:shadow-xl
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {connecting ? '🔄 Connecting...' : '💎 Connect Wallet'}
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💎</span>
            <div>
              <p className="font-medium text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={`border-purple-500/30 overflow-hidden ${className}`}>
      {/* Gradient header */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
      
      <CardContent className="p-6 text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <span className="text-3xl">💎</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>

        {/* Benefits */}
        <ul className="text-left space-y-2 mb-6">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {connecting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">🔄</span> Connecting...
            </span>
          ) : (
            'Connect Wallet'
          )}
        </button>

        {/* Supported wallets */}
        <p className="mt-4 text-xs text-muted-foreground">
          Supports Phantom, Solflare, and more
        </p>
      </CardContent>
    </Card>
  );
};

export default WalletConnectPrompt;
