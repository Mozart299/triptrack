'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import DeleteActivityButton from '@/components/features/DeleteActivityButton';
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
      <Button asChild variant="ghost" className="flex-1 min-h-[44px]">
        <Link href={`/journeys/${journeyId}/activities/${activityId}/edit`}>
          <Pencil className="size-4" />
          Edit
        </Link>
      </Button>
      <DeleteActivityButton activityId={activityId} />
    </div>
  );
}
