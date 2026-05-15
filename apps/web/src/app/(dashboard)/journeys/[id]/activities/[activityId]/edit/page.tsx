'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Profile, CostSplitType, JourneyParticipantProfile } from '@/types';
import ParticipantCostInput from '@/components/features/ParticipantCostInput';
import ParticipantSelector from '@/components/features/ParticipantSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
      const { data: participantsData } = await supabase.rpc(
        'get_journey_participants',
        { p_journey_id: p.id },
      );

      if (participantsData) {
        // Map to Profile format, using user_id as id
        const mappedParticipants = (
          participantsData as JourneyParticipantProfile[]
        ).map((p) => ({
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
          })),
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
          setError(
            `Activity updated but failed to save participant costs: ${costsError.message}`,
          );
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
      toast.error(`Error deleting activity: ${deleteError.message}`);
      setDeleting(false);
      return;
    }

    toast.success('Activity deleted');
    router.push(`/journeys/${journeyId}`);
    router.refresh();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!journeyId || !activityId) {
    return (
      <div className="container-app py-6">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (loadingActivity) {
    return (
      <div className="container-app py-6">
        <div className="text-center text-muted-foreground">
          Loading activity...
        </div>
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
            <CardTitle className="text-2xl">Edit Activity</CardTitle>
            <CardDescription>
              Update the details, timing, and cost split for this activity.
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
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: value as typeof formData.category,
                      }))
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="accommodation">Accommodation</SelectItem>
                      <SelectItem value="dining">Dining</SelectItem>
                      <SelectItem value="sightseeing">Sightseeing</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
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
                <RadioGroup
                  value={formData.costSplitType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      costSplitType: value as CostSplitType,
                    }))
                  }
                  className="space-y-2"
                >
                  <Label
                    htmlFor="split-none"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <RadioGroupItem value="none" id="split-none" />
                    <div>
                      <div className="font-medium">No Split</div>
                      <div className="text-sm text-muted-foreground">
                        Single person or untracked cost
                      </div>
                    </div>
                  </Label>
                  <Label
                    htmlFor="split-equal"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <RadioGroupItem value="equal" id="split-equal" />
                    <div>
                      <div className="font-medium">Split Equally</div>
                      <div className="text-sm text-muted-foreground">
                        Divide cost evenly among all participants
                      </div>
                    </div>
                  </Label>
                  <Label
                    htmlFor="split-individual"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <RadioGroupItem value="individual" id="split-individual" />
                    <div>
                      <div className="font-medium">Individual Costs</div>
                      <div className="text-sm text-muted-foreground">
                        Set different costs for each participant
                      </div>
                    </div>
                  </Label>
                </RadioGroup>
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
                  disabled={loading || deleting}
                  className="flex-1 min-h-[44px]"
                  size="lg"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
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

            <div className="border-t pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    disabled={loading || deleting}
                    className="w-full min-h-[44px]"
                    variant="destructive"
                    size="lg"
                  >
                    {deleting ? 'Deleting...' : 'Delete Activity'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this activity?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the activity from the journey. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      variant="destructive"
                    >
                      Delete Activity
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
