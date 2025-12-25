'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Profile, CostSplitType } from '@/types';
import ParticipantCostInput from '@/components/features/ParticipantCostInput';
import ParticipantSelector from '@/components/features/ParticipantSelector';

interface EditActivityPageProps {
  params: Promise<{
    id: string;
    activityId: string;
  }>;
}

interface ParticipantCost {
  userId: string;
  amount: number;
  notes?: string;
}

export default function EditActivityPage({ params }: EditActivityPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  // Unwrap params and load activity
  useEffect(() => {
    params.then(async (p) => {
      setJourneyId(p.id);
      setActivityId(p.activityId);

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

      loadActivity(p.activityId);
    });
  }, [params]);

  const loadActivity = async (actId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', actId)
      .single();

    if (error || !data) {
      setError('Activity not found');
      setLoadingActivity(false);
      return;
    }

    // Load participant costs if cost_split_type is 'individual'
    if (data.cost_split_type === 'individual') {
      const { data: costsData } = await supabase
        .from('activity_participant_costs')
        .select('*')
        .eq('activity_id', actId);

      if (costsData) {
        setParticipantCosts(
          costsData.map((cost) => ({
            userId: cost.user_id,
            amount: cost.amount,
            notes: cost.notes || undefined,
          }))
        );
      }
    }

    // Convert activity data to form format
    // For datetime-local input, we need to format as YYYY-MM-DDTHH:mm in local timezone
    let scheduledAtLocal = '';
    if (data.scheduled_at) {
      const date = new Date(data.scheduled_at);
      // Get local datetime string in the format YYYY-MM-DDTHH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      scheduledAtLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    setFormData({
      title: data.title,
      description: data.description || '',
      location: data.location || '',
      scheduledAt: scheduledAtLocal,
      category: data.category || 'other',
      estimatedCost: data.estimated_cost?.toString() || '',
      notes: data.notes || '',
      costSplitType: data.cost_split_type || 'none',
    });

    // Load split participants if equal split
    if (data.cost_split_type === 'equal' && data.split_participants) {
      setSelectedParticipants(data.split_participants);
    }

    setLoadingActivity(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!journeyId || !activityId) {
      setError('Journey or Activity ID not found');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Update activity
    const { error: activityError } = await supabase
      .from('activities')
      .update({
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
      .eq('id', activityId);

    if (activityError) {
      setError(activityError.message);
      setLoading(false);
      return;
    }

    // Handle participant costs
    if (formData.costSplitType === 'individual') {
      // Delete existing costs
      await supabase
        .from('activity_participant_costs')
        .delete()
        .eq('activity_id', activityId);

      // Insert new costs
      const costsToInsert = participantCosts
        .filter((cost) => cost.amount > 0)
        .map((cost) => ({
          activity_id: activityId,
          user_id: cost.userId,
          amount: cost.amount,
          notes: cost.notes || null,
        }));

      if (costsToInsert.length > 0) {
        const { error: costsError } = await supabase
          .from('activity_participant_costs')
          .insert(costsToInsert);

        if (costsError) {
          setError(`Activity updated but failed to save participant costs: ${costsError.message}`);
          setLoading(false);
          return;
        }
      }
    } else {
      // If not individual, delete any existing participant costs
      await supabase
        .from('activity_participant_costs')
        .delete()
        .eq('activity_id', activityId);
    }

    // Redirect to journey page
    router.push(`/journeys/${journeyId}`);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this activity? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    if (!journeyId || !activityId) {
      setError('Journey or Activity ID not found');
      setDeleting(false);
      return;
    }

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
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

  if (!journeyId || !activityId) {
    return (
      <div className="container-app py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (loadingActivity) {
    return (
      <div className="container-app py-6">
        <div className="text-center">Loading activity...</div>
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
            Edit Activity
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

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || deleting}
                className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href={`/journeys/${journeyId}`}
                className="flex-1 btn-secondary py-3 text-center"
              >
                Cancel
              </Link>
            </div>

            <div className="border-t pt-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || deleting}
                className="w-full py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Activity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
