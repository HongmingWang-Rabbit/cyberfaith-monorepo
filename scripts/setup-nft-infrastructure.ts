/**
 * CyberFaith NFT Infrastructure Setup Script
 * 
 * This script sets up the compressed NFT infrastructure on Solana devnet:
 * 1. Creates a Merkle Tree for compressed NFTs
 * 2. Creates a CyberFaith collection NFT
 * 
 * Run with: npx ts-node scripts/setup-nft-infrastructure.ts
 * 
 * Prerequisites:
 * - Funded Solana devnet wallet
 * - Set SOLANA_PRIVATE_KEY env var (base58 encoded)
 */

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  mplBubblegum,
  createTree,
} from '@metaplex-foundation/mpl-bubblegum';
import {
  mplTokenMetadata,
  createNft,
} from '@metaplex-foundation/mpl-token-metadata';
import { 
  generateSigner,
  keypairIdentity,
  publicKey,
  percentAmount,
} from '@metaplex-foundation/umi';
import { createSignerFromKeypair } from '@metaplex-foundation/umi';
import bs58 from 'bs58';

const DEVNET_RPC = 'https://api.devnet.solana.com';

async function main() {
  console.log('🔮 CyberFaith NFT Infrastructure Setup\n');

  // Check for private key
  const privateKeyBase58 = process.env.SOLANA_PRIVATE_KEY;
  if (!privateKeyBase58) {
    console.error('❌ SOLANA_PRIVATE_KEY environment variable not set');
    console.log('\nTo get a devnet wallet:');
    console.log('1. solana-keygen new -o ~/.config/solana/devnet.json');
    console.log('2. solana airdrop 2 --url devnet');
    console.log('3. Export the private key as base58');
    process.exit(1);
  }

  // Create Umi instance
  const umi = createUmi(DEVNET_RPC)
    .use(mplBubblegum())
    .use(mplTokenMetadata());

  // Load keypair from private key
  const secretKey = bs58.decode(privateKeyBase58);
  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(keypairIdentity(signer));

  console.log(`📍 Wallet: ${signer.publicKey}`);

  // Step 1: Create Merkle Tree
  console.log('\n📦 Step 1: Creating Merkle Tree...');
  const merkleTree = generateSigner(umi);
  
  try {
    const createTreeTx = await createTree(umi, {
      merkleTree,
      maxDepth: 14, // ~16,384 NFTs
      maxBufferSize: 64,
      canopyDepth: 0,
    }).sendAndConfirm(umi);

    console.log(`✅ Merkle Tree created: ${merkleTree.publicKey}`);
    console.log(`   Transaction: ${bs58.encode(createTreeTx.signature)}`);
  } catch (error) {
    console.error('❌ Failed to create Merkle Tree:', error);
    process.exit(1);
  }

  // Step 2: Create Collection NFT
  console.log('\n🎨 Step 2: Creating Collection NFT...');
  const collectionMint = generateSigner(umi);

  try {
    const createCollectionTx = await createNft(umi, {
      mint: collectionMint,
      name: 'CyberFaith Readings',
      symbol: 'FAITH',
      uri: 'https://arweave.net/cyberfaith-collection-metadata', // TODO: Upload real metadata
      sellerFeeBasisPoints: percentAmount(0), // No royalties
      isCollection: true,
    }).sendAndConfirm(umi);

    console.log(`✅ Collection NFT created: ${collectionMint.publicKey}`);
    console.log(`   Transaction: ${bs58.encode(createCollectionTx.signature)}`);
  } catch (error) {
    console.error('❌ Failed to create Collection NFT:', error);
    process.exit(1);
  }

  // Output configuration
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Infrastructure Setup Complete!\n');
  console.log('Add these to your .env.local:\n');
  console.log(`NEXT_PUBLIC_MERKLE_TREE_ADDRESS=${merkleTree.publicKey}`);
  console.log(`NEXT_PUBLIC_COLLECTION_ADDRESS=${collectionMint.publicKey}`);
  console.log(`NEXT_PUBLIC_SOLANA_NETWORK=devnet`);
  console.log('='.repeat(60));
}

main().catch(console.error);
