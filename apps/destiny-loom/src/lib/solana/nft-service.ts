import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  mplBubblegum,
  mintV1,
  MetadataArgsArgs,
} from '@metaplex-foundation/mpl-bubblegum';
import { 
  generateSigner,
  publicKey,
  signerIdentity,
} from '@metaplex-foundation/umi';

// Types for readings
export interface ReadingMetadata {
  type: 'tarot' | 'zodiac' | 'mbti' | 'iching' | 'four-pillars';
  title: string;
  description: string;
  imageUri?: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  timestamp: number;
}

// Devnet Merkle Tree address (needs to be created once and reused)
// TODO: Create and deploy a Merkle Tree for CyberFaith readings
const MERKLE_TREE_ADDRESS = process.env.NEXT_PUBLIC_MERKLE_TREE_ADDRESS || '';

// Collection address for CyberFaith readings
const COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_ADDRESS || '';

/**
 * Create a Umi instance for Solana interactions
 */
export function createCyberFaithUmi(rpcUrl?: string) {
  const endpoint = rpcUrl || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const umi = createUmi(endpoint).use(mplBubblegum());
  return umi;
}

/**
 * Convert reading data to NFT metadata format
 */
export function readingToMetadata(reading: ReadingMetadata): MetadataArgsArgs {
  return {
    name: reading.title,
    symbol: 'FAITH',
    uri: '', // Will be set after uploading metadata to Arweave/IPFS
    sellerFeeBasisPoints: 0, // No royalties for readings
    creators: [], // Will be filled with the minter's address
    collection: COLLECTION_ADDRESS ? { 
      key: publicKey(COLLECTION_ADDRESS), 
      verified: false 
    } : null,
    uses: null,
    primarySaleHappened: false,
    isMutable: true,
    editionNonce: null,
    tokenStandard: null,
    tokenProgramVersion: 0,
  };
}

/**
 * Get reading attributes for different reading types
 */
export function getReadingAttributes(
  type: ReadingMetadata['type'],
  data: Record<string, unknown>
): Array<{ trait_type: string; value: string }> {
  const baseAttributes = [
    { trait_type: 'Platform', value: 'CyberFaith' },
    { trait_type: 'Reading Type', value: type.toUpperCase() },
    { trait_type: 'Date', value: new Date().toISOString().split('T')[0] },
  ];

  switch (type) {
    case 'tarot':
      return [
        ...baseAttributes,
        { trait_type: 'Spread', value: String(data.spread || 'Single Card') },
        { trait_type: 'Cards', value: String(data.cards || 'Unknown') },
      ];
    case 'zodiac':
      return [
        ...baseAttributes,
        { trait_type: 'Sign', value: String(data.sign || 'Unknown') },
        { trait_type: 'Element', value: String(data.element || 'Unknown') },
      ];
    case 'mbti':
      return [
        ...baseAttributes,
        { trait_type: 'Type', value: String(data.type || 'Unknown') },
      ];
    case 'iching':
      return [
        ...baseAttributes,
        { trait_type: 'Hexagram', value: String(data.hexagram || 'Unknown') },
        { trait_type: 'Number', value: String(data.number || 'Unknown') },
      ];
    case 'four-pillars':
      return [
        ...baseAttributes,
        { trait_type: 'Day Master', value: String(data.dayMaster || 'Unknown') },
        { trait_type: 'Element', value: String(data.element || 'Unknown') },
      ];
    default:
      return baseAttributes;
  }
}

/**
 * Prepare metadata for a reading NFT
 */
export function prepareReadingNFT(
  type: ReadingMetadata['type'],
  title: string,
  description: string,
  data: Record<string, unknown>,
  imageUri?: string
): ReadingMetadata {
  return {
    type,
    title,
    description,
    imageUri,
    attributes: getReadingAttributes(type, data),
    timestamp: Date.now(),
  };
}

/**
 * Check if NFT minting is configured
 */
export function isNFTMintingConfigured(): boolean {
  return Boolean(MERKLE_TREE_ADDRESS && COLLECTION_ADDRESS);
}

/**
 * Get configuration status for NFT minting
 */
export function getNFTConfigStatus(): {
  configured: boolean;
  merkleTree: boolean;
  collection: boolean;
  message: string;
} {
  const merkleTree = Boolean(MERKLE_TREE_ADDRESS);
  const collection = Boolean(COLLECTION_ADDRESS);
  const configured = merkleTree && collection;
  
  let message = 'NFT minting is ready!';
  if (!configured) {
    const missing = [];
    if (!merkleTree) missing.push('Merkle Tree');
    if (!collection) missing.push('Collection');
    message = `Missing: ${missing.join(', ')}`;
  }
  
  return { configured, merkleTree, collection, message };
}
