import { Skeleton } from "@/components/ui/Skeleton";

export default function AssessmentsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
