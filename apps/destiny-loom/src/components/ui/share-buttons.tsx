"use client";

import { useToast } from "@/components/ui/toast";
import { useLocale } from "next-intl";

interface ShareButtonsProps {
  title: string;
  description?: string;
  /** If provided, share link points to /share/[readingId] instead of current page */
  readingId?: string;
}

export function ShareButtons({ title, description, readingId }: ShareButtonsProps) {
  const { showToast } = useToast();
  const locale = useLocale();

  const getShareUrl = () => {
    if (readingId) {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return `${origin}/${locale}/share/${readingId}`;
    }
    return typeof window !== "undefined" ? window.location.href : "";
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    showToast("Link copied! ✓");
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`${title}${description ? " — " + description : ""}`);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleWeChat = () => {
    navigator.clipboard.writeText(getShareUrl());
    showToast("Link copied — paste in WeChat to share! 💬");
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Share options">
      <button
        onClick={handleCopyLink}
        aria-label="Copy link to clipboard"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
      >
        🔗 Copy Link
      </button>
      <button
        onClick={handleTwitter}
        aria-label="Share on X (Twitter)"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted/50 text-foreground border border-border hover:border-primary/30 transition-colors"
      >
        𝕏 Share
      </button>
      <button
        onClick={handleWeChat}
        aria-label="Share on WeChat"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
      >
        💬 WeChat
      </button>
    </div>
  );
}
