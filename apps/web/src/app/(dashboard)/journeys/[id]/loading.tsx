import { Skeleton } from '@/components/ui/skeleton';

export default function JourneyDetailLoading() {
  return (
    <div className="container-app py-8">
      <Skeleton className="mb-6 h-9 w-36" />
      <Skeleton className="mb-6 h-40 w-full rounded-xl" />
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
