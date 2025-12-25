'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Profile, CostSplitType } from '@/types';
import ParticipantCostInput from '@/components/features/ParticipantCostInput';
import ParticipantSelector from '@/components/features/ParticipantSelector';

interface NewActivityPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ParticipantCost {
  userId: string;
  amount: number;
  notes?: string;
}

export default function NewActivityPage({ params }: NewActivityPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Profile[]>([]);
  const [journeyCurrency, setJourneyCurrency] = useState<string>('USD');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    scheduledAt: '',
    category: 'other' as 'transport' | 'accommodation' | 'dining' | 'sightseeing' | 'entertainment' | 'other',
    estimatedCost: '',
    notes: '',
    costSplitType: 'none' as CostSplitType,
  });

  const [participantCosts, setParticipantCosts] = useState<ParticipantCost[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  // Unwrap params on mount and fetch journey data
  useEffect(() => {
    params.then(async (p) => {
      setJourneyId(p.id);

      const supabase = createClient();

      // Fetch journey to get currency
      const { data: journey } = await supabase
        .from('journeys')
        .select('currency')
        .eq('id', p.id)
        .single();

      if (journey) {
        setJourneyCurrency(journey.currency);
      }

      // Fetch participants
      const { data: participantsData } = await supabase
        .rpc('get_journey_participants', { p_journey_id: p.id });

      if (participantsData) {
        // Map to Profile format, using user_id as id
        const mappedParticipants = participantsData.map((p: any) => ({
          id: p.user_id,
          email: p.email || '',
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          created_at: '',
          updated_at: '',
        }));
        setParticipants(mappedParticipants);
      }
    });
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!journeyId) {
      setError('Journey ID not found');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to create an activity');
      setLoading(false);
      return;
    }

    // Create activity
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .insert({
        journey_id: journeyId,
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        location: formData.location || null,
        scheduled_at: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
        category: formData.category,
        estimated_cost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
        notes: formData.notes || null,
        cost_split_type: formData.costSplitType,
        split_participants: formData.costSplitType === 'equal' ? selectedParticipants : [],
      })
      .select()
      .single();

    if (activityError) {
      setError(activityError.message);
      setLoading(false);
      return;
    }

    // If individual cost split, save participant costs
    if (formData.costSplitType === 'individual' && activity && participantCosts.length > 0) {
      const costsToInsert = participantCosts
        .filter((cost) => cost.amount > 0)
        .map((cost) => ({
          activity_id: activity.id,
          user_id: cost.userId,
          amount: cost.amount,
          notes: cost.notes || null,
        }));

      if (costsToInsert.length > 0) {
        const { error: costsError } = await supabase
          .from('activity_participant_costs')
          .insert(costsToInsert);

        if (costsError) {
          setError(`Activity created but failed to save participant costs: ${costsError.message}`);
          setLoading(false);
          return;
        }
      }
    }

    // Redirect to journey page
    router.push(`/journeys/${journeyId}`);
    router.refresh();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!journeyId) {
    return (
      <div className="container-app py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-app py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/journeys/${journeyId}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            ← Back to Journey
          </Link>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Add New Activity
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Activity Name *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Safari Tour"
                required
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="Nairobi National Park"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="scheduledAt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="scheduledAt"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="other">Other</option>
                  <option value="transport">Transport</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="dining">Dining</option>
                  <option value="sightseeing">Sightseeing</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="estimatedCost"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Estimated Cost
              </label>
              <input
                type="number"
                id="estimatedCost"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cost Split Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="costSplitType"
                    value="none"
                    checked={formData.costSplitType === 'none'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">No Split</div>
                    <div className="text-sm text-gray-600">Single person or untracked cost</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="costSplitType"
                    value="equal"
                    checked={formData.costSplitType === 'equal'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Split Equally</div>
                    <div className="text-sm text-gray-600">Divide cost evenly among all participants</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="costSplitType"
                    value="individual"
                    checked={formData.costSplitType === 'individual'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Individual Costs</div>
                    <div className="text-sm text-gray-600">Set different costs for each participant</div>
                  </div>
                </label>
              </div>
            </div>

            {formData.costSplitType === 'equal' && (
              <ParticipantSelector
                participants={participants}
                selectedParticipants={selectedParticipants}
                onChange={setSelectedParticipants}
                estimatedCost={formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined}
                currency={journeyCurrency}
              />
            )}

            {formData.costSplitType === 'individual' && (
              <ParticipantCostInput
                participants={participants}
                costs={participantCosts}
                onChange={setParticipantCosts}
                currency={journeyCurrency}
              />
            )}

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows={3}
                placeholder="What are you planning to do?"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field"
                rows={2}
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Activity'}
              </button>
              <Link
                href={`/journeys/${journeyId}`}
                className="flex-1 btn-secondary py-3 min-h-[44px] text-center flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
