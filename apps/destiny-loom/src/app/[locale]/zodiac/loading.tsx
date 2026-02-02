import { Skeleton } from "@/components/ui/skeleton";

export default function ZodiacLoading() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <Skeleton className="h-12 w-48 mx-auto" />
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
