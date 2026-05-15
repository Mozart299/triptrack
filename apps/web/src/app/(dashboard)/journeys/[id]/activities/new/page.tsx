'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile, JourneyParticipantProfile } from '@/types';
import ActivityForm, {
  ActivityFormData,
  ParticipantCost,
  defaultActivityFormData,
} from '@/components/features/ActivityForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface NewActivityPageProps {
  params: Promise<{ id: string }>;
}

export default function NewActivityPage({ params }: NewActivityPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Profile[]>([]);
  const [journeyCurrency, setJourneyCurrency] = useState('USD');

  useEffect(() => {
    params.then(async (p) => {
      setJourneyId(p.id);
      const supabase = createClient();

      const [{ data: journey }, { data: participantsData }] = await Promise.all([
        supabase.from('journeys').select('currency').eq('id', p.id).single(),
        supabase.rpc('get_journey_participants', { p_journey_id: p.id }),
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
    });
  }, [params]);

  const handleSubmit = async (
    formData: ActivityFormData,
    participantCosts: ParticipantCost[],
    selectedParticipants: string[],
  ) => {
    if (!journeyId) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to create an activity');
      setLoading(false);
      return;
    }

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

    if (
      formData.costSplitType === 'individual' &&
      activity &&
      participantCosts.length > 0
    ) {
      const costsToInsert = participantCosts
        .filter((c) => c.amount > 0)
        .map((c) => ({
          activity_id: activity.id,
          user_id: c.userId,
          amount: c.amount,
          notes: c.notes || null,
        }));

      if (costsToInsert.length > 0) {
        const { error: costsError } = await supabase
          .from('activity_participant_costs')
          .insert(costsToInsert);

        if (costsError) {
          setError(`Activity created but failed to save costs: ${costsError.message}`);
          setLoading(false);
          return;
        }
      }
    }

    router.push(`/journeys/${journeyId}`);
    router.refresh();
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
      <div className="mx-auto max-w-2xl">
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
            <ActivityForm
              initialData={defaultActivityFormData}
              participants={participants}
              currency={journeyCurrency}
              loading={loading}
              error={error}
              cancelHref={`/journeys/${journeyId}`}
              submitLabel="Add Activity"
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
