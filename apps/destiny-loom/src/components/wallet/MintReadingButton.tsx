'use client';

import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNFTMint, MintStatus } from '@/hooks/useNFTMint';
import { ReadingMetadata } from '@/lib/solana/nft-service';

interface MintReadingButtonProps {
  type: ReadingMetadata['type'];
  title: string;
  description: string;
  data: Record<string, unknown>;
  imageUri?: string;
  onSuccess?: (signature: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const statusMessages: Record<MintStatus, string> = {
  idle: 'Mint as NFT',
  preparing: 'Preparing...',
  signing: 'Sign in wallet...',
  minting: 'Minting...',
  success: 'Minted! ✓',
  error: 'Failed - Try again',
};

const statusIcons: Record<MintStatus, string> = {
  idle: '🎴',
  preparing: '⏳',
  signing: '✍️',
  minting: '⚡',
  success: '✨',
  error: '❌',
};

export const MintReadingButton: FC<MintReadingButtonProps> = ({
  type,
  title,
  description,
  data,
  imageUri,
  onSuccess,
  onError,
  className = '',
}) => {
  const { connected } = useWallet();
  const { mintReading, status, error, canMint, configStatus, reset } = useNFTMint();
  const [showDetails, setShowDetails] = useState(false);

  const handleMint = async () => {
    if (status === 'success' || status === 'error') {
      reset();
      return;
    }

    const result = await mintReading(type, title, description, data, imageUri);
    
    if (result.success && result.signature) {
      onSuccess?.(result.signature);
    } else if (result.error) {
      onError?.(result.error);
    }
  };

  // If not connected, show connect button
  if (!connected) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <p className="text-sm text-muted-foreground">Connect wallet to mint</p>
        <WalletMultiButton 
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            borderRadius: '12px',
            fontFamily: 'inherit',
            fontSize: '14px',
            height: '40px',
          }}
        />
      </div>
    );
  }

  // If not configured, show info
  if (!configStatus.configured) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <button
          disabled
          className="px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed flex items-center gap-2"
        >
          <span>🎴</span>
          <span>NFT Minting Coming Soon</span>
        </button>
        <p className="text-xs text-muted-foreground">{configStatus.message}</p>
      </div>
    );
  }

  const isLoading = ['preparing', 'signing', 'minting'].includes(status);
  const buttonClass = status === 'success' 
    ? 'bg-green-600 hover:bg-green-700' 
    : status === 'error'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-gradient-to-r from-primary to-accent hover:opacity-90';

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        onClick={handleMint}
        disabled={isLoading}
        className={`px-6 py-3 ${buttonClass} text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
      >
        <span className={isLoading ? 'animate-pulse' : ''}>{statusIcons[status]}</span>
        <span>{statusMessages[status]}</span>
      </button>
      
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
      
      {status === 'success' && (
        <p className="text-xs text-green-400">Your reading is now an NFT!</p>
      )}
      
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showDetails ? 'Hide details' : 'What is this?'}
      </button>
      
      {showDetails && (
        <div className="text-xs text-muted-foreground max-w-xs text-center p-3 bg-muted/50 rounded-lg">
          <p className="mb-2">
            <strong>Mint your reading as an NFT!</strong>
          </p>
          <ul className="text-left space-y-1">
            <li>📜 Permanent record on Solana</li>
            <li>🔐 Proof of your spiritual journey</li>
            <li>🎁 Collectible & shareable</li>
            <li>💰 Compressed NFT = nearly free!</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MintReadingButton;
