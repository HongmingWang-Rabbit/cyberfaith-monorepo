'use client';

import { FC, useState } from 'react';
import { Card, CardContent } from '@cyberfaith/ui';

interface OnboardingWizardProps {
  onComplete: () => void;
  className?: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: string;
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to CyberFaith',
    description: 'Your journey into digital divination begins here. Explore tarot, astrology, I Ching, and more.',
    icon: '🔮',
  },
  {
    id: 'zodiac',
    title: 'What\'s your sign?',
    description: 'Select your zodiac sign for personalized daily horoscopes and cosmic insights.',
    icon: '⭐',
    action: 'select_zodiac',
  },
  {
    id: 'wallet',
    title: 'Connect your wallet',
    description: 'Link your Solana wallet to mint readings as NFTs and earn karma on-chain.',
    icon: '💎',
    action: 'connect_wallet',
  },
  {
    id: 'notifications',
    title: 'Stay connected',
    description: 'Enable notifications for daily horoscopes, streak reminders, and cosmic events.',
    icon: '🔔',
    action: 'enable_notifications',
  },
  {
    id: 'ready',
    title: 'You\'re all set!',
    description: 'Your mystical journey awaits. Start with a tarot reading or explore the Spirit Arcade.',
    icon: '✨',
  },
];

const ZODIAC_SIGNS = [
  { sign: 'aries', symbol: '♈', name: 'Aries', dates: 'Mar 21 - Apr 19' },
  { sign: 'taurus', symbol: '♉', name: 'Taurus', dates: 'Apr 20 - May 20' },
  { sign: 'gemini', symbol: '♊', name: 'Gemini', dates: 'May 21 - Jun 20' },
  { sign: 'cancer', symbol: '♋', name: 'Cancer', dates: 'Jun 21 - Jul 22' },
  { sign: 'leo', symbol: '♌', name: 'Leo', dates: 'Jul 23 - Aug 22' },
  { sign: 'virgo', symbol: '♍', name: 'Virgo', dates: 'Aug 23 - Sep 22' },
  { sign: 'libra', symbol: '♎', name: 'Libra', dates: 'Sep 23 - Oct 22' },
  { sign: 'scorpio', symbol: '♏', name: 'Scorpio', dates: 'Oct 23 - Nov 21' },
  { sign: 'sagittarius', symbol: '♐', name: 'Sagittarius', dates: 'Nov 22 - Dec 21' },
  { sign: 'capricorn', symbol: '♑', name: 'Capricorn', dates: 'Dec 22 - Jan 19' },
  { sign: 'aquarius', symbol: '♒', name: 'Aquarius', dates: 'Jan 20 - Feb 18' },
  { sign: 'pisces', symbol: '♓', name: 'Pisces', dates: 'Feb 19 - Mar 20' },
];

export const OnboardingWizard: FC<OnboardingWizardProps> = ({ 
  onComplete,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null);

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Save preferences
      if (selectedZodiac) {
        localStorage.setItem('cyberfaith_zodiac', selectedZodiac);
      }
      localStorage.setItem('cyberfaith_onboarded', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const canProceed = () => {
    if (step.action === 'select_zodiac') {
      return !!selectedZodiac;
    }
    return true;
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm ${className}`}>
      <Card className="w-full max-w-lg mx-4 border-primary/30 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-muted/30">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <CardContent className="p-6">
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep 
                    ? 'bg-primary' 
                    : idx < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-muted/30'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="text-center mb-4">
            <span className="text-6xl">{step.icon}</span>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {step.title}
            </h2>
            <p className="text-muted-foreground">
              {step.description}
            </p>
          </div>

          {/* Zodiac selector */}
          {step.action === 'select_zodiac' && (
            <div className="grid grid-cols-4 gap-2 mb-6">
              {ZODIAC_SIGNS.map(zodiac => (
                <button
                  key={zodiac.sign}
                  onClick={() => setSelectedZodiac(zodiac.sign)}
                  className={`p-2 rounded-lg text-center transition-all ${
                    selectedZodiac === zodiac.sign
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'bg-muted/20 hover:bg-muted/40'
                  }`}
                >
                  <span className="text-2xl block">{zodiac.symbol}</span>
                  <span className="text-[10px] block mt-1">{zodiac.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Wallet connect placeholder */}
          {step.action === 'connect_wallet' && (
            <div className="flex justify-center mb-6">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all">
                Connect Wallet 💎
              </button>
            </div>
          )}

          {/* Notification enable placeholder */}
          {step.action === 'enable_notifications' && (
            <div className="flex justify-center mb-6">
              <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg transition-all">
                Enable Notifications 🔔
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {step.action && (
              <button
                onClick={handleSkip}
                className="flex-1 py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                canProceed()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {currentStep === STEPS.length - 1 ? 'Get Started' : 'Continue'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
