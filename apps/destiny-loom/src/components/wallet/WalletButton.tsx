'use client';

import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface WalletButtonProps {
  className?: string;
}

export const WalletButton: FC<WalletButtonProps> = ({ className }) => {
  const { publicKey, connected } = useWallet();

  return (
    <div className={className}>
      <WalletMultiButton 
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          borderRadius: '12px',
          fontFamily: 'inherit',
          fontSize: '14px',
          height: '40px',
          padding: '0 16px',
        }}
      />
      {connected && publicKey && (
        <p className="text-xs text-purple-400 mt-1 text-center">
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </p>
      )}
    </div>
  );
};

export default WalletButton;
