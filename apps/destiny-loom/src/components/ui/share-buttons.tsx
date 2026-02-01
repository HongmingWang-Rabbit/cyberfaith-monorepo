"use client";

import { useToast } from "@/components/ui/toast";

interface ShareButtonsProps {
  title: string;
  description?: string;
}

export function ShareButtons({ title, description }: ShareButtonsProps) {
  const { showToast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied! ✓");
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`${title}${description ? " — " + description : ""}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleWeChat = () => {
    // WeChat sharing typically requires scanning a QR code with the URL
    // For now we copy the link and show a message
    navigator.clipboard.writeText(window.location.href);
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
