'use client';

import { FC, useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: (steps: TourStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

interface TourProviderProps {
  children: ReactNode;
}

export const TourProvider: FC<TourProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);

  const startTour = (tourSteps: TourStep[]) => {
    setSteps(tourSteps);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
    // Mark tour as completed
    localStorage.setItem('cyberfaith_tour_completed', 'true');
  };

  const skipTour = () => {
    endTour();
  };

  return (
    <TourContext.Provider value={{ isActive, currentStep, steps, startTour, nextStep, prevStep, endTour, skipTour }}>
      {children}
      {isActive && steps.length > 0 && (
        <TourOverlay step={steps[currentStep]} stepNumber={currentStep + 1} totalSteps={steps.length} />
      )}
    </TourContext.Provider>
  );
};

interface TourOverlayProps {
  step: TourStep;
  stepNumber: number;
  totalSteps: number;
}

const TourOverlay: FC<TourOverlayProps> = ({ step, stepNumber, totalSteps }) => {
  const { nextStep, prevStep, skipTour } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step.target]);

  const position = step.position || 'bottom';
  
  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const padding = 12;
    switch (position) {
      case 'top':
        return { bottom: `${window.innerHeight - targetRect.top + padding}px`, left: `${targetRect.left + targetRect.width / 2}px`, transform: 'translateX(-50%)' };
      case 'bottom':
        return { top: `${targetRect.bottom + padding}px`, left: `${targetRect.left + targetRect.width / 2}px`, transform: 'translateX(-50%)' };
      case 'left':
        return { top: `${targetRect.top + targetRect.height / 2}px`, right: `${window.innerWidth - targetRect.left + padding}px`, transform: 'translateY(-50%)' };
      case 'right':
        return { top: `${targetRect.top + targetRect.height / 2}px`, left: `${targetRect.right + padding}px`, transform: 'translateY(-50%)' };
      default:
        return { top: `${targetRect.bottom + padding}px`, left: `${targetRect.left + targetRect.width / 2}px`, transform: 'translateX(-50%)' };
    }
  };

  return (
    <>
      {/* Backdrop with spotlight */}
      <div className="fixed inset-0 z-50 bg-black/70" onClick={skipTour} />
      
      {/* Spotlight on target */}
      {targetRect && (
        <div
          className="fixed z-50 rounded-lg ring-4 ring-primary ring-offset-4 ring-offset-transparent pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 w-80 p-4 rounded-xl bg-background border border-primary/30 shadow-2xl"
        style={getTooltipPosition()}
      >
        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">
            Step {stepNumber} of {totalSteps}
          </span>
          <button onClick={skipTour} className="text-xs text-muted-foreground hover:text-foreground">
            Skip tour
          </button>
        </div>

        {/* Content */}
        <h4 className="font-bold text-foreground mb-2">{step.title}</h4>
        <p className="text-sm text-muted-foreground mb-4">{step.content}</p>

        {/* Navigation */}
        <div className="flex gap-2">
          {stepNumber > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 text-sm font-medium transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={nextStep}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {stepNumber === totalSteps ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
};

// Default tour steps for CyberFaith
export const DEFAULT_TOUR_STEPS: TourStep[] = [
  { id: 'welcome', target: '[data-tour="logo"]', title: 'Welcome to CyberFaith! 🔮', content: 'Your journey into digital divination begins here. Let me show you around.', position: 'bottom' },
  { id: 'readings', target: '[data-tour="readings"]', title: 'Mystical Readings', content: 'Explore tarot, zodiac, I Ching, and more. Each reading can be minted as an NFT.', position: 'bottom' },
  { id: 'arcade', target: '[data-tour="arcade"]', title: 'Spirit Arcade 🎮', content: 'Play fortune cookie, rune cast, crystal ball and earn karma points.', position: 'bottom' },
  { id: 'wallet', target: '[data-tour="wallet"]', title: 'Connect Your Wallet 💎', content: 'Link your Solana wallet to mint readings as NFTs and track your karma on-chain.', position: 'left' },
  { id: 'profile', target: '[data-tour="profile"]', title: 'Your Profile', content: 'View your karma, streaks, achievements, and reading history here.', position: 'left' },
];

export default TourProvider;
