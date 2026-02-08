'use client';

import { FC, useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
  text?: string;
  className?: string;
  showLabels?: boolean;
}

type SharePlatform = 'twitter' | 'facebook' | 'telegram' | 'whatsapp' | 'copy';

interface PlatformConfig {
  icon: string;
  label: string;
  color: string;
  getUrl: (url: string, title: string, text?: string) => string;
}

const platforms: Record<SharePlatform, PlatformConfig> = {
  twitter: {
    icon: '𝕏',
    label: 'Twitter',
    color: 'hover:bg-black/80 hover:text-white',
    getUrl: (url, title, text) => 
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || title)}`,
  },
  facebook: {
    icon: 'f',
    label: 'Facebook',
    color: 'hover:bg-[#1877F2] hover:text-white',
    getUrl: (url) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  telegram: {
    icon: '✈️',
    label: 'Telegram',
    color: 'hover:bg-[#0088cc] hover:text-white',
    getUrl: (url, title, text) => 
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || title)}`,
  },
  whatsapp: {
    icon: '📱',
    label: 'WhatsApp',
    color: 'hover:bg-[#25D366] hover:text-white',
    getUrl: (url, title, text) => 
      `https://wa.me/?text=${encodeURIComponent((text || title) + ' ' + url)}`,
  },
  copy: {
    icon: '📋',
    label: 'Copy',
    color: 'hover:bg-primary/80 hover:text-white',
    getUrl: () => '',
  },
};

export const ShareButtons: FC<ShareButtonsProps> = ({
  url,
  title,
  text,
  className = '',
  showLabels = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: SharePlatform) => {
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      return;
    }

    const shareUrl = platforms[platform].getUrl(url, title, text);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Native share button (mobile) */}
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <button
          onClick={handleNativeShare}
          className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          aria-label="Share"
        >
          <span className="text-lg">↗️</span>
        </button>
      )}

      {/* Platform buttons */}
      {(Object.keys(platforms) as SharePlatform[]).map((platform) => {
        const config = platforms[platform];
        const isCopied = platform === 'copy' && copied;

        return (
          <button
            key={platform}
            onClick={() => handleShare(platform)}
            className={`
              p-2 rounded-full bg-muted/20 transition-all duration-200
              ${config.color}
              ${showLabels ? 'px-3 gap-1.5' : ''}
            `}
            aria-label={config.label}
          >
            <span className="text-sm font-bold">
              {isCopied ? '✓' : config.icon}
            </span>
            {showLabels && (
              <span className="text-xs font-medium">
                {isCopied ? 'Copied!' : config.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ShareButtons;
