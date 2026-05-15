import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
      <Skeleton className="mb-6 h-48 w-full rounded-xl" />
      <Skeleton className="mb-8 h-20 w-full rounded-xl" />
      <Skeleton className="mb-4 h-6 w-32" />
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}
