'use client';

import { FC } from 'react';
import { MintStatus } from '@/hooks/useNFTMint';

interface MintingProgressProps {
  status: MintStatus;
  error?: string | null;
  signature?: string;
  onClose?: () => void;
}

const steps = [
  { key: 'preparing', label: 'Preparing metadata', icon: '📝' },
  { key: 'uploading', label: 'Uploading to chain', icon: '☁️' },
  { key: 'signing', label: 'Sign in wallet', icon: '✍️' },
  { key: 'minting', label: 'Minting NFT', icon: '⚡' },
];

const statusOrder: MintStatus[] = ['idle', 'preparing', 'uploading', 'signing', 'minting', 'success', 'error'];

export const MintingProgress: FC<MintingProgressProps> = ({
  status,
  error,
  signature,
  onClose,
}) => {
  if (status === 'idle') return null;

  const currentIndex = statusOrder.indexOf(status);
  const isComplete = status === 'success';
  const isError = status === 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-4xl block mb-2">
            {isComplete ? '✨' : isError ? '❌' : '🔮'}
          </span>
          <h3 className="text-xl font-bold text-foreground">
            {isComplete ? 'NFT Minted!' : isError ? 'Minting Failed' : 'Minting Your Reading'}
          </h3>
          {isComplete && signature && (
            <p className="text-sm text-muted-foreground mt-1">
              Signature: {signature.slice(0, 12)}...
            </p>
          )}
        </div>

        {/* Progress steps */}
        {!isComplete && !isError && (
          <div className="space-y-3 mb-6">
            {steps.map((step, index) => {
              const stepIndex = statusOrder.indexOf(step.key as MintStatus);
              const isActive = status === step.key;
              const isDone = currentIndex > stepIndex;
              const isPending = currentIndex < stepIndex;

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/10 border border-primary/30'
                      : isDone
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-muted/30 border border-transparent'
                  }`}
                >
                  <span className={`text-xl ${isActive ? 'animate-pulse' : ''}`}>
                    {isDone ? '✅' : step.icon}
                  </span>
                  <span
                    className={`text-sm ${
                      isActive
                        ? 'text-primary font-medium'
                        : isDone
                        ? 'text-green-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                    {isActive && '...'}
                  </span>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Success state */}
        {isComplete && (
          <div className="text-center mb-6">
            <p className="text-muted-foreground mb-4">
              Your reading is now a collectible NFT on Solana!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                🎴 Collectible
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                🔗 On-chain
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                ✨ Yours forever
              </span>
            </div>
          </div>
        )}

        {/* Error state */}
        {isError && error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        {(isComplete || isError) && onClose && (
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors"
          >
            {isComplete ? 'Done' : 'Try Again'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MintingProgress;
