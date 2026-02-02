"use client";

import { FollowButton } from "@/components/community/follow-button";
import { ReportButton } from "@/components/community/report-modal";
import { UserBadges } from "@/components/community/user-badges";

export function ProfileFollowButton({ userId }: { userId: string }) {
  return <FollowButton userId={userId} />;
}

export function ProfileReportButton({ userId }: { userId: string }) {
  return <ReportButton targetType="user" targetId={userId} className="text-sm" />;
}

export function ProfileBadges({ userId }: { userId: string }) {
  return <UserBadges userId={userId} />;
}
