import {
  CalendarClock,
  Check,
  CircleDollarSign,
  MapPin,
} from 'lucide-react';
import ActivityActions from '@/components/features/ActivityActions';
import ActivityCostBreakdown from '@/components/features/ActivityCostBreakdown';
import DeleteActivityButton from '@/components/features/DeleteActivityButton';
import MarkActivityPaid from '@/components/features/MarkActivityPaid';
import UndoCheckIn from '@/components/features/UndoCheckIn';
import { formatCurrency } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ActivityRowProps {
  activity: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    scheduled_at: string | null;
    category: string | null;
    estimated_cost: number | null;
    cost_paid: boolean;
    cost_split_type: string | null;
    completed_at: string | null;
  };
  journeyId: string;
  currency: string;
  completedItem?: boolean;
}

export default function ActivityRow({
  activity,
  journeyId,
  currency,
  completedItem = false,
}: ActivityRowProps) {
  return (
    <Card className={completedItem ? 'opacity-70' : undefined}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {completedItem && <Check className="size-4 text-emerald-600" />}
              <h3 className={`font-medium ${completedItem ? 'line-through' : ''}`}>
                {activity.title}
              </h3>
              {activity.category && (
                <Badge variant="secondary">{activity.category}</Badge>
              )}
              {activity.cost_paid && (
                <Badge className="bg-emerald-100 text-emerald-700">Paid</Badge>
              )}
            </div>

            {activity.description && !completedItem && (
              <p className="mb-2 text-sm text-muted-foreground">
                {activity.description}
              </p>
            )}

            {activity.location && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {activity.location}
              </p>
            )}

            {activity.scheduled_at && !completedItem && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                {new Date(activity.scheduled_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            )}

            {activity.estimated_cost != null && !completedItem && (
              <div className="mt-2 text-sm">
                <p className={activity.cost_paid ? 'line-through opacity-60' : ''}>
                  <CircleDollarSign className="mr-1 inline size-3.5 text-muted-foreground" />
                  Estimated: {formatCurrency(activity.estimated_cost, currency)}
                </p>
                {activity.cost_split_type === 'equal' && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Split equally among participants
                  </p>
                )}
                {activity.cost_split_type === 'individual' && (
                  <div className="mt-2 rounded-lg border bg-muted/40 p-2">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Individual costs:
                    </p>
                    <ActivityCostBreakdown
                      activityId={activity.id}
                      currency={currency}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          {activity.estimated_cost != null && activity.estimated_cost > 0 && (
            <MarkActivityPaid
              activityId={activity.id}
              initialPaidStatus={activity.cost_paid}
            />
          )}
          {completedItem ? (
            <>
              <UndoCheckIn activityId={activity.id} />
              <DeleteActivityButton activityId={activity.id} />
            </>
          ) : (
            <ActivityActions activityId={activity.id} journeyId={journeyId} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
