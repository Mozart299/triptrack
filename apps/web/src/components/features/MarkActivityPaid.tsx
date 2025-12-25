'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface MarkActivityPaidProps {
  activityId: string;
  initialPaidStatus: boolean;
  showLabel?: boolean;
}

export default function MarkActivityPaid({
  activityId,
  initialPaidStatus,
  showLabel = true,
}: MarkActivityPaidProps) {
  const [isPaid, setIsPaid] = useState(initialPaidStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('activities')
      .update({ cost_paid: !isPaid })
      .eq('id', activityId);

    if (!error) {
      setIsPaid(!isPaid);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isPaid
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {isPaid ? (
        <>
          <span className="text-lg">✓</span>
          {showLabel && <span>Paid</span>}
        </>
      ) : (
        <>
          <span className="text-lg">💵</span>
          {showLabel && <span>Mark as Paid</span>}
        </>
      )}
    </button>
  );
}
