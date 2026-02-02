import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function TarotLoading() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <Skeleton className="h-12 w-56 mx-auto" />
      <Skeleton className="h-5 w-72 mx-auto" />
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
      <CardSkeleton />
    </div>
  );
}
