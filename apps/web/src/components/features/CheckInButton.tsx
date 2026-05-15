'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function CheckInButton({ activityId }: { activityId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckIn = async () => {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('activities')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', activityId);

    if (error) {
      toast.error('Failed to check in');
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Button
      onClick={handleCheckIn}
      disabled={loading}
      size="sm"
      className="min-h-[44px]"
    >
      <Check className="size-4" />
      {loading ? 'Checking in...' : 'Check In'}
    </Button>
  );
}
