'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface UndoCheckInProps {
  activityId: string;
}

export default function UndoCheckIn({ activityId }: UndoCheckInProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUndo = async () => {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('activities')
      .update({ completed_at: null })
      .eq('id', activityId);

    if (error) {
      toast.error('Failed to undo check-in');
      setLoading(false);
      return;
    }

    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={loading}
      onClick={handleUndo}
      className="min-h-[44px]"
    >
      <RotateCcw className="size-4" />
      Undo
    </Button>
  );
}
