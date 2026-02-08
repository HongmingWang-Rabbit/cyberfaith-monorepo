'use client';

import { FC, useState, useEffect } from 'react';

interface QuickSettingsProps {
  className?: string;
}

interface Settings {
  haptics: boolean;
  sounds: boolean;
  darkMode: boolean;
  notifications: boolean;
  autoSave: boolean;
}

const defaultSettings: Settings = {
  haptics: true,
  sounds: true,
  darkMode: true,
  notifications: true,
  autoSave: true,
};

const settingsConfig: { key: keyof Settings; label: string; icon: string; description: string }[] = [
  { key: 'haptics', label: 'Haptic Feedback', icon: '📳', description: 'Vibration on interactions' },
  { key: 'sounds', label: 'Sound Effects', icon: '🔊', description: 'Audio feedback' },
  { key: 'darkMode', label: 'Dark Mode', icon: '🌙', description: 'Dark theme' },
  { key: 'notifications', label: 'Notifications', icon: '🔔', description: 'Push notifications' },
  { key: 'autoSave', label: 'Auto-Save Readings', icon: '💾', description: 'Save readings automatically' },
];

export const QuickSettings: FC<QuickSettingsProps> = ({ className = '' }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cyberfaith_settings');
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  const toggleSetting = (key: keyof Settings) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('cyberfaith_settings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Settings button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors"
      >
        <span className="text-xl">⚙️</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-bold text-foreground">Quick Settings</h3>
            </div>

            {/* Settings list */}
            <div className="p-2">
              {settingsConfig.map(({ key, label, icon, description }) => (
                <button
                  key={key}
                  onClick={() => toggleSetting(key)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  {/* Icon */}
                  <span className="text-xl">{icon}</span>

                  {/* Label */}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>

                  {/* Toggle */}
                  <div className={`
                    w-10 h-6 rounded-full transition-colors relative
                    ${settings[key] ? 'bg-primary' : 'bg-muted/50'}
                  `}>
                    <div className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                      ${settings[key] ? 'translate-x-5' : 'translate-x-1'}
                    `} />
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View All Settings →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuickSettings;
