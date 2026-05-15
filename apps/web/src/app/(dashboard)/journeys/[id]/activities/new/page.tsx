'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile, CostSplitType } from '@/types';
import ParticipantCostInput from '@/components/features/ParticipantCostInput';
import ParticipantSelector from '@/components/features/ParticipantSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
    category: 'other' as
      | 'transport'
      | 'accommodation'
      | 'dining'
      | 'sightseeing'
      | 'entertainment'
      | 'other',
    estimatedCost: '',
    notes: '',
    costSplitType: 'none' as CostSplitType,
  });

  const [participantCosts, setParticipantCosts] = useState<ParticipantCost[]>(
    [],
  );
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );

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
      const { data: participantsData } = await supabase.rpc(
        'get_journey_participants',
        { p_journey_id: p.id },
      );

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
        scheduled_at: formData.scheduledAt
          ? new Date(formData.scheduledAt).toISOString()
          : null,
        category: formData.category,
        estimated_cost: formData.estimatedCost
          ? parseFloat(formData.estimatedCost)
          : null,
        notes: formData.notes || null,
        cost_split_type: formData.costSplitType,
        split_participants:
          formData.costSplitType === 'equal' ? selectedParticipants : [],
      })
      .select()
      .single();

    if (activityError) {
      setError(activityError.message);
      setLoading(false);
      return;
    }

    // If individual cost split, save participant costs
    if (
      formData.costSplitType === 'individual' &&
      activity &&
      participantCosts.length > 0
    ) {
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
          setError(
            `Activity created but failed to save participant costs: ${costsError.message}`,
          );
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!journeyId) {
    return (
      <div className="container-app py-6">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-app py-6">
      <div className="max-w-2xl mx-auto">
        <Button asChild variant="ghost" className="mb-6 px-0">
          <Link href={`/journeys/${journeyId}`}>
            <ArrowLeft className="size-4" />
            Back to Journey
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Activity</CardTitle>
            <CardDescription>
              Add a plan, booking, meal, or stop to this trip.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Activity Name *</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Museum visit"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City center"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                  <Input
                    type="datetime-local"
                    id="scheduledAt"
                    name="scheduledAt"
                    value={formData.scheduledAt}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost</Label>
                <Input
                  type="number"
                  id="estimatedCost"
                  name="estimatedCost"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="space-y-3">
                <Label>Cost Split Type</Label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <input
                      type="radio"
                      name="costSplitType"
                      value="none"
                      checked={formData.costSplitType === 'none'}
                      onChange={handleChange}
                      className="size-4 accent-primary"
                    />
                    <div>
                      <div className="font-medium">No Split</div>
                      <div className="text-sm text-muted-foreground">
                        Single person or untracked cost
                      </div>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <input
                      type="radio"
                      name="costSplitType"
                      value="equal"
                      checked={formData.costSplitType === 'equal'}
                      onChange={handleChange}
                      className="size-4 accent-primary"
                    />
                    <div>
                      <div className="font-medium">Split Equally</div>
                      <div className="text-sm text-muted-foreground">
                        Divide cost evenly among all participants
                      </div>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <input
                      type="radio"
                      name="costSplitType"
                      value="individual"
                      checked={formData.costSplitType === 'individual'}
                      onChange={handleChange}
                      className="size-4 accent-primary"
                    />
                    <div>
                      <div className="font-medium">Individual Costs</div>
                      <div className="text-sm text-muted-foreground">
                        Set different costs for each participant
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.costSplitType === 'equal' && (
                <ParticipantSelector
                  participants={participants}
                  selectedParticipants={selectedParticipants}
                  onChange={setSelectedParticipants}
                  estimatedCost={
                    formData.estimatedCost
                      ? parseFloat(formData.estimatedCost)
                      : undefined
                  }
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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="What are you planning to do?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 min-h-[44px]"
                  size="lg"
                >
                  {loading ? 'Adding...' : 'Add Activity'}
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="flex-1 min-h-[44px]"
                  size="lg"
                >
                  <Link href={`/journeys/${journeyId}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
