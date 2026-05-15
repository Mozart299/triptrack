import { Skeleton } from '@/components/ui/skeleton';

export default function EditJourneyLoading() {
  return (
    <div className="container-app py-6">
      <div className="mx-auto max-w-2xl">
        <Skeleton className="mb-6 h-9 w-36" />
        <Skeleton className="h-[480px] w-full rounded-xl" />
      </div>
    </div>
  );
}
