'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Activity } from '@/types';
import { formatCurrency } from '@/lib/currency';
import ActivityCostBreakdown from './ActivityCostBreakdown';

interface ActivityCheckInProps {
  activity: Activity;
  currency: string;
}

export default function ActivityCheckIn({ activity, currency }: ActivityCheckInProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckIn = async () => {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('activities')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', activity.id);

    if (!error) {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">
              {activity.category === 'dining'
                ? '🍽️'
                : activity.category === 'accommodation'
                ? '🏨'
                : activity.category === 'transport'
                ? '🚗'
                : activity.category === 'sightseeing'
                ? '🏛️'
                : activity.category === 'entertainment'
                ? '🎭'
                : '📍'}
            </span>
            <h3 className="font-bold text-gray-900">{activity.title}</h3>
          </div>
          {activity.description && (
            <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
          )}
          {activity.estimated_cost !== undefined && activity.estimated_cost !== null && (
            <div className="text-sm text-gray-700 mb-2">
              <p>💵 Estimated: {formatCurrency(activity.estimated_cost, currency)}</p>
              {activity.cost_split_type === 'equal' && (
                <p className="text-xs text-gray-600 mt-1">Split equally among participants</p>
              )}
              {activity.cost_split_type === 'individual' && (
                <div className="mt-2 bg-white/50 p-2 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium mb-1">Individual costs:</p>
                  <ActivityCostBreakdown activityId={activity.id} currency={currency} />
                </div>
              )}
            </div>
          )}
          {activity.location && (
            <p className="text-xs text-gray-600 font-medium">
              📍 {activity.location}
            </p>
          )}
          {activity.scheduled_at && (
            <p className="text-xs text-gray-600 mt-1">
              🕒{' '}
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
      <button
        onClick={handleCheckIn}
        disabled={loading}
        className="w-full mt-4 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {loading ? 'Checking in...' : '✓ Check In'}
      </button>
    </div>
  );
}
