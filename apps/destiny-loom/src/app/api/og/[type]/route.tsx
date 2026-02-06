import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const typeEmojis: Record<string, string> = {
  tarot: '🃏',
  zodiac: '⭐',
  mbti: '🧠',
  iching: '☯️',
  'four-pillars': '🏛️',
  dream: '🌙',
  numerology: '🔢',
  default: '🔮',
};

const typeLabels: Record<string, string> = {
  tarot: 'Tarot Reading',
  zodiac: 'Zodiac Reading',
  mbti: 'MBTI Result',
  iching: 'I Ching Divination',
  'four-pillars': 'Four Pillars',
  dream: 'Dream Interpretation',
  numerology: 'Numerology',
  default: 'Spiritual Reading',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const { searchParams } = new URL(request.url);
  
  const title = searchParams.get('title') || typeLabels[type] || typeLabels.default;
  const subtitle = searchParams.get('subtitle') || '';
  const emoji = typeEmojis[type] || typeEmojis.default;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 50%, #2d1b4e 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            zIndex: 1,
          }}
        >
          {/* Emoji */}
          <span style={{ fontSize: '120px' }}>{emoji}</span>

          {/* Title */}
          <h1
            style={{
              fontSize: '60px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #8b5cf6 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              textAlign: 'center',
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p
              style={{
                fontSize: '28px',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
                textAlign: 'center',
                maxWidth: '800px',
              }}
            >
              {subtitle}
            </p>
          )}

          {/* Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '20px',
            }}
          >
            <span style={{ fontSize: '32px' }}>🔮</span>
            <span
              style={{
                fontSize: '24px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 500,
              }}
            >
              CyberFaith
            </span>
          </div>
        </div>

        {/* NFT badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(168, 85, 247, 0.2)',
            borderRadius: '20px',
            border: '1px solid rgba(168, 85, 247, 0.3)',
          }}
        >
          <span style={{ fontSize: '16px', color: '#a855f7' }}>✨</span>
          <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Mintable as NFT
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
