export interface BadgeDefinition {
  key: string;
  title: string;
  icon: string;
  check: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalReadings: number;
  karma: number;
  totalAchievements: number;
  followerCount: number;
  commentCount: number;
  accountAgeDays: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { key: "novice_reader", title: "Novice Reader", icon: "📖", check: (s) => s.totalReadings >= 10 },
  { key: "avid_reader", title: "Avid Reader", icon: "📚", check: (s) => s.totalReadings >= 50 },
  { key: "master_reader", title: "Master Reader", icon: "🏆", check: (s) => s.totalReadings >= 100 },
  { key: "legendary_reader", title: "Legendary Reader", icon: "👑", check: (s) => s.totalReadings >= 500 },
  { key: "karma_initiate", title: "Karma Initiate", icon: "✨", check: (s) => s.karma >= 100 },
  { key: "karma_adept", title: "Karma Adept", icon: "🌟", check: (s) => s.karma >= 500 },
  { key: "karma_master", title: "Karma Master", icon: "💫", check: (s) => s.karma >= 1000 },
  { key: "karma_legend", title: "Karma Legend", icon: "🌠", check: (s) => s.karma >= 5000 },
  { key: "achiever", title: "Achiever", icon: "🎯", check: (s) => s.totalAchievements >= 5 },
  { key: "completionist", title: "Completionist", icon: "💎", check: (s) => s.totalAchievements >= 9 },
  { key: "influencer", title: "Influencer", icon: "📢", check: (s) => s.followerCount >= 10 },
  { key: "community_star", title: "Community Star", icon: "⭐", check: (s) => s.followerCount >= 50 },
  { key: "commentator", title: "Commentator", icon: "💬", check: (s) => s.commentCount >= 20 },
  { key: "veteran", title: "Veteran", icon: "🎖️", check: (s) => s.accountAgeDays >= 365 },
];
