'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ActivityActionsProps {
  activityId: string;
  journeyId: string;
}

export default function ActivityActions({
  activityId,
  journeyId,
}: ActivityActionsProps) {
  return (
    <div className="flex gap-2 pt-2 border-t">
      <Button asChild variant="ghost" className="flex-1">
        <Link href={`/journeys/${journeyId}/activities/${activityId}/edit`}>
          Edit
        </Link>
      </Button>
    </div>
  );
}
