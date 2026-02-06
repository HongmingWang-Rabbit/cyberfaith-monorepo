'use client';

import { FC, useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Card, CardContent } from '@cyberfaith/ui';

interface WalletStatsProps {
  className?: string;
}

export const WalletStats: FC<WalletStatsProps> = ({ className = '' }) => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBalance() {
      if (!publicKey || !connected) {
        setBalance(null);
        return;
      }

      setLoading(true);
      try {
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        setBalance(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, [publicKey, connected, connection]);

  if (!connected || !publicKey) {
    return null;
  }

  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Wallet icon */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-2xl">💎</span>
          </div>

          {/* Stats */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Solana Wallet</p>
            <p className="text-xs text-muted-foreground truncate">
              {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
            </p>
          </div>

          {/* Balance */}
          <div className="text-right">
            {loading ? (
              <div className="h-6 w-16 bg-muted/30 animate-pulse rounded" />
            ) : balance !== null ? (
              <>
                <p className="text-lg font-bold text-foreground">
                  {balance.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">SOL</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">--</p>
            )}
          </div>
        </div>

        {/* NFT stats placeholder */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground">NFTs Minted</p>
            </div>
            <div>
              <p className="text-lg font-bold text-accent">0</p>
              <p className="text-xs text-muted-foreground">Readings</p>
            </div>
            <div>
              <p className="text-lg font-bold text-highlight">0</p>
              <p className="text-xs text-muted-foreground">Karma</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletStats;
