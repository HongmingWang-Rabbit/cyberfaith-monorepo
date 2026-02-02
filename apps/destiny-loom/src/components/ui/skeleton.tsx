export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted/50 ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <Skeleton className="h-12 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-4 w-40" />
      {/* Podium */}
      <div className="flex justify-center gap-4 py-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
      {/* List */}
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/30">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-12" />
        </div>
      ))}
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      <Skeleton className="h-10 w-40" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-6 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function JournalSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-4 w-56" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card p-4 text-center space-y-2">
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

export function NotificationsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-3">
      <Skeleton className="h-10 w-48" />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/30">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-4 w-72" />
      <div className="flex justify-center gap-4 py-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-24 rounded-xl" />
        ))}
      </div>
      <CardSkeleton />
    </div>
  );
}
