'use client';

import { FC } from 'react';
import { WalletStats } from '@/components/wallet';
import { KarmaTracker } from '@/components/karma';
import { StreakTracker } from '@/components/streaks';
import { ReadingHistory } from '@/components/history';
import { DailyChallenge } from '@/components/daily';
import { AchievementsGrid } from '@/components/achievements';

interface ProfileDashboardProps {
  className?: string;
}

export const ProfileDashboard: FC<ProfileDashboardProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top row - Key stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WalletStats className="lg:col-span-1" />
        <KarmaTracker className="lg:col-span-1" showBreakdown />
        <StreakTracker className="lg:col-span-1" />
      </div>

      {/* Middle row - Daily engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyChallenge />
        <ReadingHistory limit={5} />
      </div>

      {/* Bottom - Achievements */}
      <AchievementsGrid />
    </div>
  );
};

export default ProfileDashboard;
