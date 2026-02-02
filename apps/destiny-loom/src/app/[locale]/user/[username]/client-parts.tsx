"use client";

import { FollowButton } from "@/components/community/follow-button";
import { ReportButton } from "@/components/community/report-modal";

export function ProfileFollowButton({ userId }: { userId: string }) {
  return <FollowButton userId={userId} />;
}

export function ProfileReportButton({ userId }: { userId: string }) {
  return <ReportButton targetType="user" targetId={userId} className="text-sm" />;
}
