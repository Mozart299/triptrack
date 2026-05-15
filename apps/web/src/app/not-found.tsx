import Link from 'next/link';
import { Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-secondary text-primary">
        <Plane className="size-7" />
      </div>
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-xl font-semibold">Page not found</p>
      <p className="mt-2 text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/journeys">View Journeys</Link>
        </Button>
      </div>
    </div>
  );
}
