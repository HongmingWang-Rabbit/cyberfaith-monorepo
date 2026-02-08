'use client';

import { FC, useState } from 'react';

interface ReadingFeedbackProps {
  readingId: string;
  onSubmit?: (feedback: { rating: number; resonated: boolean; comment?: string }) => void;
  className?: string;
}

const RATING_EMOJIS = ['😞', '😐', '🙂', '😊', '🤩'];
const RATING_LABELS = ['Not helpful', 'Somewhat', 'Good', 'Great', 'Amazing!'];

export const ReadingFeedback: FC<ReadingFeedbackProps> = ({
  readingId,
  onSubmit,
  className = '',
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [resonated, setResonated] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = () => {
    if (rating === null) return;
    
    const feedback = {
      rating,
      resonated: resonated ?? false,
      comment: comment.trim() || undefined,
    };

    // Save to localStorage
    try {
      const stored = localStorage.getItem('cyberfaith_feedback') || '{}';
      const allFeedback = JSON.parse(stored);
      allFeedback[readingId] = { ...feedback, timestamp: new Date().toISOString() };
      localStorage.setItem('cyberfaith_feedback', JSON.stringify(allFeedback));
    } catch (err) {
      console.error('Failed to save feedback:', err);
    }

    onSubmit?.(feedback);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={`p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center ${className}`}>
        <span className="text-2xl mb-2 block">✨</span>
        <p className="text-green-400 font-medium">Thank you for your feedback!</p>
        <p className="text-xs text-muted-foreground mt-1">+10 karma earned</p>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl bg-muted/10 border border-muted/30 ${className}`}>
      {/* Header */}
      <p className="text-sm text-muted-foreground mb-3 text-center">
        How was this reading?
      </p>

      {/* Rating */}
      <div className="flex justify-center gap-2 mb-4">
        {RATING_EMOJIS.map((emoji, idx) => (
          <button
            key={idx}
            onClick={() => {
              setRating(idx);
              setExpanded(true);
            }}
            className={`
              w-10 h-10 rounded-full text-xl transition-all
              ${rating === idx 
                ? 'bg-primary scale-110 shadow-lg' 
                : 'bg-muted/30 hover:bg-muted/50 hover:scale-105'
              }
            `}
            title={RATING_LABELS[idx]}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Rating label */}
      {rating !== null && (
        <p className="text-center text-sm text-primary mb-4">
          {RATING_LABELS[rating]}
        </p>
      )}

      {/* Expanded feedback */}
      {expanded && (
        <div className="space-y-4 animate-fade-in">
          {/* Resonance question */}
          <div>
            <p className="text-sm text-muted-foreground mb-2 text-center">
              Did this reading resonate with you?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setResonated(true)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${resonated === true 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted/30 hover:bg-muted/50'
                  }
                `}
              >
                ✨ Yes, it did
              </button>
              <button
                onClick={() => setResonated(false)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${resonated === false 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-muted/30 hover:bg-muted/50'
                  }
                `}
              >
                🤔 Not really
              </button>
            </div>
          </div>

          {/* Optional comment */}
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any thoughts to share? (optional)"
              className="w-full px-3 py-2 rounded-lg bg-muted/20 border border-muted/30 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={2}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={rating === null}
            className={`
              w-full py-2 rounded-lg font-medium transition-all
              ${rating !== null
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            Submit Feedback
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReadingFeedback;
