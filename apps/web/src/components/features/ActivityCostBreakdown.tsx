'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/currency';
import type { ActivityParticipantCostWithProfile } from '@/types';

interface ParticipantCostData {
  user_id: string;
  amount: number;
  notes: string | null;
  full_name: string | null;
  email: string;
}

interface ActivityCostBreakdownProps {
  activityId: string;
  currency: string;
}

export default function ActivityCostBreakdown({
  activityId,
  currency,
}: ActivityCostBreakdownProps) {
  const [costs, setCosts] = useState<ParticipantCostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCosts = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from('activity_participant_costs')
        .select(
          `
          user_id,
          amount,
          notes,
          profiles:user_id (
            full_name,
            email
          )
        `,
        )
        .eq('activity_id', activityId);

      if (data) {
        const formattedCosts = (
          data as unknown as ActivityParticipantCostWithProfile[]
        ).map((cost) => ({
          user_id: cost.user_id,
          amount: cost.amount,
          notes: cost.notes,
          full_name: cost.profiles?.full_name || null,
          email: cost.profiles?.email || '',
        }));
        setCosts(formattedCosts);
      }

      setLoading(false);
    };

    fetchCosts();
  }, [activityId]);

  if (loading) {
    return <p className="text-xs text-muted-foreground">Loading costs...</p>;
  }

  if (costs.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No individual costs set</p>
    );
  }

  const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <div className="mt-2 space-y-2">
      {costs.map((cost) => (
        <div
          key={cost.user_id}
          className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex-1 min-w-0">
            <span className="block truncate font-medium">
              {cost.full_name || cost.email}
            </span>
            {cost.notes && (
              <span className="block truncate text-muted-foreground sm:ml-1 sm:inline">
                ({cost.notes})
              </span>
            )}
          </div>
          <span className="font-medium sm:shrink-0">
            {formatCurrency(cost.amount, currency)}
          </span>
        </div>
      ))}
      {costs.length > 1 && (
        <div className="flex flex-col gap-1 border-t pt-2 text-xs font-semibold sm:flex-row sm:items-center sm:justify-between">
          <span>Total</span>
          <span className="sm:shrink-0">
            {formatCurrency(totalCost, currency)}
          </span>
        </div>
      )}
    </div>
  );
}
