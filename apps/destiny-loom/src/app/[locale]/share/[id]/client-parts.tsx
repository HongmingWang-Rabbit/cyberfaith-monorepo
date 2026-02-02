"use client";

import { CommentsSection } from "@/components/community/comments-section";
import { ReportButton } from "@/components/community/report-modal";

export function SharePageComments({ readingId }: { readingId: string }) {
  return <CommentsSection readingId={readingId} />;
}

export function SharePageReportButton({ readingId }: { readingId: string }) {
  return <ReportButton targetType="reading" targetId={readingId} className="text-sm" />;
}
