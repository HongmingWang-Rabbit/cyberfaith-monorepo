'use client';

import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Card, CardContent } from '@cyberfaith/ui';

export const SolanaCTA: FC = () => {
  const { connected, publicKey } = useWallet();

  if (connected && publicKey) {
    return (
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-sm font-medium text-foreground">
                Wallet connected — your readings can be minted as NFTs!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-primary/5 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Left: Text content */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <span className="text-2xl">🔮</span>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Powered by Solana
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Connect your wallet to mint readings as NFTs
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>🎴 Collect your spiritual journey on-chain</li>
              <li>✨ Compressed NFTs = nearly free to mint</li>
              <li>🔐 Verifiable provenance for every reading</li>
            </ul>
          </div>

          {/* Right: Connect button */}
          <div className="shrink-0">
            <WalletMultiButton
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                borderRadius: '12px',
                fontFamily: 'inherit',
                fontSize: '14px',
                height: '48px',
                padding: '0 24px',
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolanaCTA;
