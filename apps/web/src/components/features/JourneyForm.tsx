'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// Define the shape of our data
interface JourneyFormData {
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
}

interface JourneyFormProps {
  initialData?: JourneyFormData; // If provided, we are in "Edit Mode"
  journeyId?: string;            // Needed for updates
}

export default function JourneyForm({ initialData, journeyId }: JourneyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize state with existing data (Edit) or defaults (Create)
  const [formData, setFormData] = useState<JourneyFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    destination: initialData?.destination || '',
    // Handle date formatting (YYYY-MM-DD) for inputs
    start_date: initialData?.start_date 
      ? new Date(initialData.start_date).toISOString().split('T')[0] 
      : '',
    end_date: initialData?.end_date 
      ? new Date(initialData.end_date).toISOString().split('T')[0] 
      : '',
  });

  const isEditMode = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in.');
      setLoading(false);
      return;
    }

    try {
      if (isEditMode && journeyId) {
        // --- EDIT MODE ---
        const { error: updateError } = await supabase
          .from('journeys')
          .update({
            title: formData.title,
            description: formData.description,
            destination: formData.destination,
            start_date: formData.start_date,
            end_date: formData.end_date,
          })
          .eq('id', journeyId);

        if (updateError) throw updateError;
        
        router.push(`/journeys/${journeyId}`);

      } else {
        // --- CREATE MODE ---
        const { data: journey, error: createError } = await supabase
          .from('journeys')
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            destination: formData.destination,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: 'planning',
          })
          .select()
          .single();

        if (createError) throw createError;

        // Add owner as participant
        const { error: participantError } = await supabase
          .from('journey_participants')
          .insert({
            journey_id: journey.id,
            user_id: user.id,
            role: 'owner',
          });

        if (participantError) throw participantError;

        router.push(`/journeys/${journey.id}`);
      }

      router.refresh();

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Trip Name *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input-field"
          placeholder="Nairobi Adventure"
          required
        />
      </div>

      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
          Destination *
        </label>
        <input
          type="text"
          id="destination"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          className="input-field"
          placeholder="Nairobi, Kenya"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input-field"
          rows={4}
          placeholder="Tell us about your trip..."
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Journey')}
        </button>
        <Link
          href={isEditMode ? `/journeys/${journeyId}` : "/dashboard"}
          className="flex-1 btn-secondary py-3 text-center"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}