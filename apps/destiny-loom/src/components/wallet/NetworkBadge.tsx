'use client';

import { FC } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

interface NetworkBadgeProps {
  className?: string;
}

export const NetworkBadge: FC<NetworkBadgeProps> = ({ className = '' }) => {
  const { connection } = useConnection();
  const [network, setNetwork] = useState<'mainnet' | 'devnet' | 'testnet' | 'unknown'>('unknown');

  useEffect(() => {
    const endpoint = connection.rpcEndpoint.toLowerCase();
    if (endpoint.includes('mainnet')) {
      setNetwork('mainnet');
    } else if (endpoint.includes('devnet')) {
      setNetwork('devnet');
    } else if (endpoint.includes('testnet')) {
      setNetwork('testnet');
    } else {
      setNetwork('unknown');
    }
  }, [connection.rpcEndpoint]);

  const config = {
    mainnet: { label: 'Mainnet', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    devnet: { label: 'Devnet', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    testnet: { label: 'Testnet', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    unknown: { label: 'Unknown', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  };

  const { label, color } = config[network];

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
        ${color}
        ${className}
      `}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {label}
    </span>
  );
};

export default NetworkBadge;
