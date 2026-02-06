'use client';

import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  prepareReadingNFT, 
  isNFTMintingConfigured,
  getNFTConfigStatus,
  ReadingMetadata 
} from '@/lib/solana/nft-service';

export type MintStatus = 'idle' | 'preparing' | 'signing' | 'minting' | 'success' | 'error';

export interface MintResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export function useNFTMint() {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState<MintStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const configStatus = getNFTConfigStatus();

  const canMint = connected && publicKey && configStatus.configured;

  const mintReading = useCallback(async (
    type: ReadingMetadata['type'],
    title: string,
    description: string,
    data: Record<string, unknown>,
    imageUri?: string
  ): Promise<MintResult> => {
    if (!connected || !publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (!configStatus.configured) {
      return { success: false, error: configStatus.message };
    }

    try {
      setStatus('preparing');
      setError(null);

      // Prepare the reading metadata
      const metadata = prepareReadingNFT(type, title, description, data, imageUri);
      
      // TODO: Upload metadata to Arweave/IPFS and get URI
      // TODO: Call Bubblegum mintV1 with the metadata URI
      // For now, we'll simulate the process
      
      setStatus('signing');
      
      // Simulate transaction signing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('minting');
      
      // Simulate minting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus('success');
      
      // Return mock signature for now
      return { 
        success: true, 
        signature: 'mock_signature_' + Date.now() 
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStatus('error');
      return { success: false, error: errorMessage };
    }
  }, [connected, publicKey, configStatus]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    mintReading,
    status,
    error,
    canMint,
    isConnected: connected,
    walletAddress: publicKey?.toBase58(),
    configStatus,
    reset,
  };
}
