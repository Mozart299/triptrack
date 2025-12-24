'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface EditActivityPageProps {
  params: Promise<{
    id: string;
    activityId: string;
  }>;
}

export default function EditActivityPage({ params }: EditActivityPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    scheduledAt: '',
    category: 'other' as 'transport' | 'accommodation' | 'dining' | 'sightseeing' | 'entertainment' | 'other',
    estimatedCost: '',
    notes: '',
  });

  // Unwrap params and load activity
  useEffect(() => {
    params.then((p) => {
      setJourneyId(p.id);
      setActivityId(p.activityId);
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
    });
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
      })
      .eq('id', activityId);

    if (activityError) {
      setError(activityError.message);
      setLoading(false);
      return;
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
                Estimated Cost (USD)
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
