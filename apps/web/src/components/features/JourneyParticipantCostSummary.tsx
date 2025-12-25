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
  const [participantTotals, setParticipantTotals] = useState<ParticipantTotal[]>([]);
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
            const perPerson = activity.estimated_cost / selectedParticipants.length;
            selectedParticipants.forEach((userId) => {
              if (totals[userId] !== undefined) {
                totals[userId] = (totals[userId] || 0) + perPerson;
              }
            });
          }
        } else if (activity.cost_split_type === 'individual' && participantCosts) {
          // Use individual costs
          const activityCosts = participantCosts.filter(
            (pc) => pc.activity_id === activity.id
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
    return <p className="text-sm text-gray-500">Calculating costs...</p>;
  }

  if (participantTotals.length === 0) {
    return null;
  }

  const grandTotal = participantTotals.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="space-y-3">
      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Cost Per Participant</h3>
      <div className="space-y-2">
        {participantTotals.map((participant) => (
          <div
            key={participant.userId}
            className="flex items-center justify-between py-3 px-2 sm:px-3 border-b border-gray-100 min-h-[44px]"
          >
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {participant.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{participant.email}</p>
            </div>
            <div className="text-sm sm:text-base font-semibold text-gray-900 shrink-0">
              {formatCurrency(participant.total, currency)}
            </div>
          </div>
        ))}
      </div>
      {participantTotals.length > 1 && (
        <div className="flex items-center justify-between pt-3 px-2 sm:px-3 border-t-2 border-gray-300 min-h-[44px]">
          <p className="text-sm sm:text-base font-bold text-gray-900">Total</p>
          <p className="text-sm sm:text-base font-bold text-primary-700 shrink-0">
            {formatCurrency(grandTotal, currency)}
          </p>
        </div>
      )}
    </div>
  );
}
