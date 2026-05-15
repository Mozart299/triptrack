'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarClock, Check, CircleDollarSign, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Activity } from '@/types';
import { formatCurrency } from '@/lib/currency';
import ActivityCostBreakdown from './ActivityCostBreakdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityCheckInProps {
  activity: Activity;
  currency: string;
}

export default function ActivityCheckIn({
  activity,
  currency,
}: ActivityCheckInProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckIn = async () => {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('activities')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', activity.id);

    if (error) {
      toast.error('Failed to check in');
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Card className="border-primary/30 bg-accent/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="secondary">{activity.category || 'activity'}</Badge>
          {activity.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {activity.description && (
              <p className="mb-2 text-sm text-muted-foreground">
                {activity.description}
              </p>
            )}
            {activity.estimated_cost !== undefined &&
              activity.estimated_cost !== null && (
                <div className="mb-2 text-sm text-foreground">
                  <p className="flex items-center gap-1.5">
                    <CircleDollarSign className="size-4 text-muted-foreground" />
                    Estimated:{' '}
                    {formatCurrency(activity.estimated_cost, currency)}
                  </p>
                  {activity.cost_split_type === 'equal' && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Split equally among participants
                    </p>
                  )}
                  {activity.cost_split_type === 'individual' && (
                    <div className="mt-2 rounded-lg border bg-background/70 p-2">
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
            {activity.location && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MapPin className="size-3.5" />
                {activity.location}
              </p>
            )}
            {activity.scheduled_at && (
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
          </div>
        </div>
        <Button
          onClick={handleCheckIn}
          disabled={loading}
          className="mt-4 w-full"
          size="lg"
        >
          <Check className="size-4" />
          {loading ? 'Checking in...' : 'Check In'}
        </Button>
      </CardContent>
    </Card>
  );
}
