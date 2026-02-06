import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory metadata store for demo (use Arweave/IPFS in production)
const metadataStore = new Map<string, object>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type,
      name,
      description,
      attributes = [],
      image,
      readingData,
    } = body;

    // Generate a unique ID for this metadata
    const hash = crypto.createHash('sha256')
      .update(JSON.stringify({ type, name, description, attributes, readingData, timestamp: Date.now() }))
      .digest('hex')
      .slice(0, 16);

    // Build NFT metadata following Metaplex standard
    const metadata = {
      name,
      symbol: 'FAITH',
      description,
      image: image || `https://cyberfaith.app/api/og/${type}?hash=${hash}`,
      external_url: `https://cyberfaith.app/readings/${hash}`,
      attributes: [
        { trait_type: 'Platform', value: 'CyberFaith' },
        { trait_type: 'Reading Type', value: type?.toUpperCase() || 'READING' },
        { trait_type: 'Minted At', value: new Date().toISOString() },
        ...attributes,
      ],
      properties: {
        category: 'image',
        files: [],
        creators: [],
      },
      // Store the full reading data for reference
      cyberfaith: {
        version: '1.0',
        type,
        readingData,
        timestamp: Date.now(),
      },
    };

    // Store metadata (in production, upload to Arweave/IPFS)
    metadataStore.set(hash, metadata);

    // Return the metadata URI
    // In production, this would be an Arweave/IPFS URI
    const uri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://cyberfaith.app'}/api/nft/metadata/${hash}`;

    return NextResponse.json({
      success: true,
      hash,
      uri,
      metadata,
    });
  } catch (error) {
    console.error('Metadata creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create metadata', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve metadata by hash
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get('hash');

  if (!hash) {
    return NextResponse.json(
      { error: 'Hash parameter required' },
      { status: 400 }
    );
  }

  const metadata = metadataStore.get(hash);
  
  if (!metadata) {
    return NextResponse.json(
      { error: 'Metadata not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(metadata);
}
