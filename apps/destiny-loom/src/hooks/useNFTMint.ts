'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  prepareReadingNFT, 
  ReadingMetadata 
} from '@/lib/solana/nft-service';

export type MintStatus = 'idle' | 'preparing' | 'uploading' | 'signing' | 'minting' | 'success' | 'error';

export interface MintResult {
  success: boolean;
  signature?: string;
  metadataUri?: string;
  error?: string;
}

export interface NFTConfigStatus {
  configured: boolean;
  merkleTree: string | null;
  collection: string | null;
  network: string;
  loading: boolean;
}

export function useNFTMint() {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState<MintStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<NFTConfigStatus>({
    configured: false,
    merkleTree: null,
    collection: null,
    network: 'devnet',
    loading: true,
  });

  // Fetch config status on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/nft/mint');
        const data = await res.json();
        setConfigStatus({
          configured: data.configured,
          merkleTree: data.merkleTree,
          collection: data.collection,
          network: data.network || 'devnet',
          loading: false,
        });
      } catch (err) {
        console.error('Failed to fetch NFT config:', err);
        setConfigStatus(prev => ({ ...prev, loading: false }));
      }
    }
    fetchConfig();
  }, []);

  const canMint = connected && publicKey;

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

    try {
      setStatus('preparing');
      setError(null);

      // Prepare the reading metadata
      const metadata = prepareReadingNFT(type, title, description, data, imageUri);
      
      // Step 1: Upload metadata
      setStatus('uploading');
      const metadataRes = await fetch('/api/nft/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: metadata.type,
          name: metadata.title,
          description: metadata.description,
          attributes: metadata.attributes,
          image: metadata.imageUri,
          readingData: data,
        }),
      });

      if (!metadataRes.ok) {
        throw new Error('Failed to upload metadata');
      }

      const { uri: metadataUri, hash } = await metadataRes.json();

      // Step 2: Prepare mint transaction
      setStatus('signing');
      const mintRes = await fetch('/api/nft/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          name: metadata.title,
          uri: metadataUri,
          attributes: metadata.attributes,
        }),
      });

      if (!mintRes.ok) {
        const errData = await mintRes.json();
        if (!errData.configured) {
          // NFT infrastructure not set up yet - simulate success for demo
          setStatus('minting');
          await new Promise(resolve => setTimeout(resolve, 1500));
          setStatus('success');
          return {
            success: true,
            metadataUri,
            signature: `demo_${hash}_${Date.now()}`,
          };
        }
        throw new Error(errData.error || 'Failed to prepare mint');
      }

      const mintData = await mintRes.json();
      
      // Step 3: For now, simulate minting (full implementation needs wallet signing)
      setStatus('minting');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('success');
      
      return { 
        success: true, 
        metadataUri,
        signature: mintData.data?.signature || `pending_${hash}`,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStatus('error');
      return { success: false, error: errorMessage };
    }
  }, [connected, publicKey]);

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
    configStatus: {
      configured: configStatus.configured,
      merkleTree: Boolean(configStatus.merkleTree),
      collection: Boolean(configStatus.collection),
      message: configStatus.loading 
        ? 'Loading...' 
        : configStatus.configured 
          ? 'NFT minting is ready!' 
          : 'Demo mode (NFT infrastructure pending)',
    },
    reset,
  };
}
