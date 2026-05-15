'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CircleDollarSign } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

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
    <Button
      onClick={handleToggle}
      disabled={loading}
      variant={isPaid ? 'secondary' : 'outline'}
      className="min-h-[44px]"
    >
      {isPaid ? (
        <>
          <Check className="size-4" />
          {showLabel && <span>Paid</span>}
        </>
      ) : (
        <>
          <CircleDollarSign className="size-4" />
          {showLabel && <span>Mark as Paid</span>}
        </>
      )}
    </Button>
  );
}
