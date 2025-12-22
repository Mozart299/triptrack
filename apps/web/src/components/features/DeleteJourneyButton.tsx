'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // Note: using client client

export default function DeleteJourneyButton({ journeyId }: { journeyId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    // 1. Safety check
    const confirmed = window.confirm(
      'Are you sure you want to delete this journey? This cannot be undone.'
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      // 2. Delete from Supabase
      const { error } = await supabase
        .from('journeys')
        .delete()
        .eq('id', journeyId);

      if (error) {
        alert('Error deleting journey: ' + error.message);
        setIsDeleting(false);
        return;
      }

      // 3. Redirect to the main list
      router.push('/journeys');
      router.refresh(); // Refresh the cache to remove the item from the list
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full btn-secondary text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? 'Deleting...' : 'Delete Journey'}
    </button>
  );
}