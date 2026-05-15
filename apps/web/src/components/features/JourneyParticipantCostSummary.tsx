'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/currency';
import { Activity, Profile } from '@/types';

interface ParticipantTotal {
  userId: string;
  name: string;
  email: string;
  total: number;
}

interface JourneyParticipantCostSummaryProps {
  journeyId: string;
  participants: Profile[];
  currency: string;
}

export default function JourneyParticipantCostSummary({
  journeyId,
  participants,
  currency,
}: JourneyParticipantCostSummaryProps) {
  const [participantTotals, setParticipantTotals] = useState<
    ParticipantTotal[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateTotals = async () => {
      const supabase = createClient();

      // Fetch all activities for this journey
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('journey_id', journeyId);

      if (!activities || participants.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch all activity participant costs
      const activityIds = activities.map((a) => a.id);
      const { data: participantCosts } = await supabase
        .from('activity_participant_costs')
        .select('*')
        .in('activity_id', activityIds);

      // Calculate totals for each participant
      const totals: Record<string, number> = {};

      // Initialize all participants with 0
      participants.forEach((p) => {
        totals[p.id] = 0;
      });

      // Calculate based on each activity
      activities.forEach((activity: Activity) => {
        if (!activity.estimated_cost || activity.estimated_cost === 0) {
          return;
        }

        if (activity.cost_split_type === 'equal') {
          // Divide equally among selected participants
          const selectedParticipants = activity.split_participants || [];
          if (selectedParticipants.length > 0) {
            const perPerson =
              activity.estimated_cost / selectedParticipants.length;
            selectedParticipants.forEach((userId) => {
              if (totals[userId] !== undefined) {
                totals[userId] = (totals[userId] || 0) + perPerson;
              }
            });
          }
        } else if (
          activity.cost_split_type === 'individual' &&
          participantCosts
        ) {
          // Use individual costs
          const activityCosts = participantCosts.filter(
            (pc) => pc.activity_id === activity.id,
          );
          activityCosts.forEach((cost) => {
            if (totals[cost.user_id] !== undefined) {
              totals[cost.user_id] = (totals[cost.user_id] || 0) + cost.amount;
            }
          });
        }
        // 'none' split type is not counted
      });

      // Convert to array
      const totalsArray = participants.map((p) => ({
        userId: p.id,
        name: p.full_name || p.email,
        email: p.email,
        total: totals[p.id] || 0,
      }));

      setParticipantTotals(totalsArray);
      setLoading(false);
    };

    calculateTotals();
  }, [journeyId, participants, currency]);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Calculating costs...</p>
    );
  }

  if (participantTotals.length === 0) {
    return null;
  }

  const grandTotal = participantTotals.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="space-y-3">
      <h3 className="text-sm sm:text-base font-semibold">
        Cost Per Participant
      </h3>
      <div className="space-y-2">
        {participantTotals.map((participant) => (
          <div
            key={participant.userId}
            className="flex min-h-[44px] items-center justify-between border-b py-3 px-2 sm:px-3"
          >
            <div className="flex-1 min-w-0 pr-3">
              <p className="truncate text-sm font-medium">{participant.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {participant.email}
              </p>
            </div>
            <div className="shrink-0 text-sm font-semibold sm:text-base">
              {formatCurrency(participant.total, currency)}
            </div>
          </div>
        ))}
      </div>
      {participantTotals.length > 1 && (
        <div className="flex min-h-[44px] items-center justify-between border-t-2 px-2 pt-3 sm:px-3">
          <p className="text-sm font-bold sm:text-base">Total</p>
          <p className="shrink-0 text-sm font-bold text-primary sm:text-base">
            {formatCurrency(grandTotal, currency)}
          </p>
        </div>
      )}
    </div>
  );
}
