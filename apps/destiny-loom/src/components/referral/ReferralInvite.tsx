'use client';

import { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cyberfaith/ui';

interface ReferralInviteProps {
  className?: string;
  userId?: string;
}

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  pendingRewards: number;
  earnedKarma: number;
}

export const ReferralInvite: FC<ReferralInviteProps> = ({ 
  className = '',
  userId,
}) => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate or load referral code
    try {
      const stored = localStorage.getItem('cyberfaith_referral');
      if (stored) {
        setStats(JSON.parse(stored));
      } else {
        // Generate new referral code
        const code = userId 
          ? userId.slice(0, 8).toUpperCase()
          : Math.random().toString(36).substring(2, 10).toUpperCase();
        
        const newStats: ReferralStats = {
          referralCode: code,
          totalReferrals: 0,
          pendingRewards: 0,
          earnedKarma: 0,
        };
        setStats(newStats);
        localStorage.setItem('cyberfaith_referral', JSON.stringify(newStats));
      }
    } catch (err) {
      console.error('Failed to load referral stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const referralUrl = typeof window !== 'undefined' && stats
    ? `${window.location.origin}?ref=${stats.referralCode}`
    : '';

  const copyToClipboard = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareVia = (platform: 'twitter' | 'whatsapp' | 'telegram') => {
    if (!referralUrl || !stats) return;
    
    const text = `Join me on CyberFaith! Get mystical readings, mint them as NFTs, and earn karma. Use my invite: ${referralUrl}`;
    
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent('Join me on CyberFaith!')}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (loading || !stats) {
    return (
      <Card className={`border-primary/20 ${className}`}>
        <CardContent className="p-4">
          <div className="h-32 bg-muted/30 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary/20 overflow-hidden ${className}`}>
      {/* Gradient header */}
      <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          🎁 Invite Friends
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <p className="text-xl font-bold text-foreground">{stats.totalReferrals}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <p className="text-xl font-bold text-amber-400">{stats.pendingRewards}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <p className="text-xl font-bold text-green-400">{stats.earnedKarma}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </div>
        </div>

        {/* Referral link */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 px-3 py-2 rounded-lg bg-muted/20 text-sm text-muted-foreground truncate font-mono">
            {referralUrl}
          </div>
          <button
            onClick={copyToClipboard}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => shareVia('twitter')}
            className="flex-1 py-2 rounded-lg bg-black hover:bg-black/80 text-white text-sm font-medium transition-colors"
          >
            𝕏 Twitter
          </button>
          <button
            onClick={() => shareVia('whatsapp')}
            className="flex-1 py-2 rounded-lg bg-[#25D366] hover:bg-[#25D366]/80 text-white text-sm font-medium transition-colors"
          >
            WhatsApp
          </button>
          <button
            onClick={() => shareVia('telegram')}
            className="flex-1 py-2 rounded-lg bg-[#0088cc] hover:bg-[#0088cc]/80 text-white text-sm font-medium transition-colors"
          >
            Telegram
          </button>
        </div>

        {/* Reward info */}
        <p className="mt-4 text-xs text-center text-muted-foreground">
          Earn <span className="text-amber-400 font-bold">100 karma</span> for each friend who joins!
        </p>
      </CardContent>
    </Card>
  );
};

export default ReferralInvite;
