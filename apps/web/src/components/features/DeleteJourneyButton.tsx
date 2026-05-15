'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function DeleteJourneyButton({
  journeyId,
}: {
  journeyId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this journey? This cannot be undone.',
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('journeys')
        .delete()
        .eq('id', journeyId);

      if (error) {
        alert('Error deleting journey: ' + error.message);
        setIsDeleting(false);
        return;
      }

      router.push('/journeys');
      router.refresh();
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full"
      variant="destructive"
    >
      {isDeleting ? 'Deleting...' : 'Delete Journey'}
    </Button>
  );
}
