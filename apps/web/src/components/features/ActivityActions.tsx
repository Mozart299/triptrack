'use client';

import Link from 'next/link';

interface ActivityActionsProps {
  activityId: string;
  journeyId: string;
}

export default function ActivityActions({ activityId, journeyId }: ActivityActionsProps) {
  return (
    <div className="flex gap-2 pt-2 border-t border-gray-100">
      <Link
        href={`/journeys/${journeyId}/activities/${activityId}/edit`}
        className="flex-1 text-center px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded transition-colors"
      >
        Edit
      </Link>
    </div>
  );
}
