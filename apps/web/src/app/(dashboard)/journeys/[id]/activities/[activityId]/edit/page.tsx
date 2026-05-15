'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Profile, JourneyParticipantProfile } from '@/types';
import ActivityForm, {
  ActivityFormData,
  ActivityCategory,
  ParticipantCost,
} from '@/components/features/ActivityForm';
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

interface EditActivityPageProps {
  params: Promise<{ id: string; activityId: string }>;
}

export default function EditActivityPage({ params }: EditActivityPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Profile[]>([]);
  const [journeyCurrency, setJourneyCurrency] = useState('USD');
  const [initialData, setInitialData] = useState<ActivityFormData | null>(null);
  const [initialParticipantCosts, setInitialParticipantCosts] = useState<ParticipantCost[]>([]);
  const [initialSelectedParticipants, setInitialSelectedParticipants] = useState<string[]>([]);

  useEffect(() => {
    params.then(async (p) => {
      setJourneyId(p.id);
      setActivityId(p.activityId);

      const supabase = createClient();

      const [{ data: journey }, { data: participantsData }, { data: activity, error: actErr }] =
        await Promise.all([
          supabase.from('journeys').select('currency').eq('id', p.id).single(),
          supabase.rpc('get_journey_participants', { p_journey_id: p.id }),
          supabase.from('activities').select('*').eq('id', p.activityId).single(),
        ]);

      if (journey) setJourneyCurrency(journey.currency);

      if (participantsData) {
        setParticipants(
          (participantsData as JourneyParticipantProfile[]).map((p) => ({
            id: p.user_id,
            email: p.email || '',
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            created_at: '',
            updated_at: '',
          })),
        );
      }

      if (actErr || !activity) {
        setError('Activity not found');
        setLoadingActivity(false);
        return;
      }

      if (activity.cost_split_type === 'individual') {
        const { data: costsData } = await supabase
          .from('activity_participant_costs')
          .select('*')
          .eq('activity_id', p.activityId);

        if (costsData) {
          setInitialParticipantCosts(
            costsData.map((c) => ({
              userId: c.user_id,
              amount: c.amount,
              notes: c.notes || undefined,
            })),
          );
        }
      }

      if (activity.cost_split_type === 'equal' && activity.split_participants) {
        setInitialSelectedParticipants(activity.split_participants);
      }

      let scheduledAtLocal = '';
      if (activity.scheduled_at) {
        const d = new Date(activity.scheduled_at);
        scheduledAtLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      }

      setInitialData({
        title: activity.title,
        description: activity.description || '',
        location: activity.location || '',
        scheduledAt: scheduledAtLocal,
        category: (activity.category || 'other') as ActivityCategory,
        estimatedCost: activity.estimated_cost?.toString() || '',
        notes: activity.notes || '',
        costSplitType: activity.cost_split_type || 'none',
      });

      setLoadingActivity(false);
    });
  }, [params]);

  const handleSubmit = async (
    formData: ActivityFormData,
    participantCosts: ParticipantCost[],
    selectedParticipants: string[],
  ) => {
    if (!journeyId || !activityId) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();

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

    await supabase
      .from('activity_participant_costs')
      .delete()
      .eq('activity_id', activityId);

    if (formData.costSplitType === 'individual') {
      const costsToInsert = participantCosts
        .filter((c) => c.amount > 0)
        .map((c) => ({
          activity_id: activityId,
          user_id: c.userId,
          amount: c.amount,
          notes: c.notes || null,
        }));

      if (costsToInsert.length > 0) {
        const { error: costsError } = await supabase
          .from('activity_participant_costs')
          .insert(costsToInsert);

        if (costsError) {
          setError(`Activity updated but failed to save costs: ${costsError.message}`);
          setLoading(false);
          return;
        }
      }
    }

    router.push(`/journeys/${journeyId}`);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!journeyId || !activityId) return;
    setDeleting(true);

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);

    if (deleteError) {
      toast.error(`Error deleting activity: ${deleteError.message}`);
      setDeleting(false);
      return;
    }

    toast.success('Activity deleted');
    router.push(`/journeys/${journeyId}`);
    router.refresh();
  };

  if (!journeyId || !activityId || loadingActivity) {
    return (
      <div className="container-app py-6">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-app py-6">
      <div className="mx-auto max-w-2xl">
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
            {initialData && (
              <ActivityForm
                initialData={initialData}
                initialParticipantCosts={initialParticipantCosts}
                initialSelectedParticipants={initialSelectedParticipants}
                participants={participants}
                currency={journeyCurrency}
                loading={loading || deleting}
                error={error}
                cancelHref={`/journeys/${journeyId}`}
                submitLabel="Save Changes"
                onSubmit={handleSubmit}
                extraActions={
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
                            This removes the activity from the journey and cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
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
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
