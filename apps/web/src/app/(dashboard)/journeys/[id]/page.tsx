import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Users,
} from 'lucide-react';
import InviteParticipant from '@/components/features/InviteParticipant';
import { createClient } from '@/lib/supabase/server';
import type { JourneyParticipant, Profile } from '@/types';

type ParticipantWithProfile = JourneyParticipant & {
  profiles: Profile | null;
};
import DeleteActivityButton from '@/components/features/DeleteActivityButton';
import DeleteJourneyButton from '@/components/features/DeleteJourneyButton';
import ActivityCostBreakdown from '@/components/features/ActivityCostBreakdown';
import JourneyParticipantCostSummary from '@/components/features/JourneyParticipantCostSummary';
import MarkActivityPaid from '@/components/features/MarkActivityPaid';
import { formatCurrency } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const dynamic = 'force-dynamic';

interface JourneyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JourneyDetailPage({
  params,
}: JourneyDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: journey, error: journeyError } = await supabase
    .from('journeys')
    .select('*')
    .eq('id', id)
    .single();

  if (journeyError || !journey) {
    notFound();
  }

  const [{ data: activities }, { data: participantsData }] = await Promise.all([
    supabase
      .from('activities')
      .select('*')
      .eq('journey_id', id)
      .order('scheduled_at', { ascending: true }),
    supabase
      .from('journey_participants')
      .select(
        `
        *,
        profiles:user_id (
          id,
          email,
          full_name,
          avatar_url,
          created_at,
          updated_at
        )
      `,
      )
      .eq('journey_id', id),
  ]);
  const participants = (participantsData ?? []) as ParticipantWithProfile[];

  const isOwner = journey.user_id === user.id;
  const completedActivities =
    activities?.filter((a) => a.completed_at).length || 0;

  const startDate = new Date(journey.start_date);
  const endDate = new Date(journey.end_date);
  const today = new Date();
  const isActive = today >= startDate && today <= endDate;
  const isCompleted = today > endDate;
  const daysUntil = Math.ceil(
    (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const tripDuration = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="container-app py-8">
      <Button asChild variant="ghost" className="mb-6 px-0">
        <Link href="/journeys">
          <ArrowLeft className="size-4" />
          Back to Journeys
        </Link>
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">{journey.title}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-base">
            <MapPin className="size-4" />
            {journey.destination}
          </CardDescription>
          <CardAction>
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className={isCompleted ? 'bg-muted text-muted-foreground' : ''}
            >
              {isActive ? 'Active' : isCompleted ? 'Completed' : 'Planning'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              Start:{' '}
              {startDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              End:{' '}
              {endDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" />
              Duration: {tripDuration} day{tripDuration !== 1 ? 's' : ''}
            </div>
          </div>

          {journey.description && (
            <p className="text-muted-foreground">{journey.description}</p>
          )}

          {!isCompleted && !isActive && daysUntil > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-3 text-sm text-secondary-foreground">
              <Clock className="size-4" />
              Your trip starts in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
            </div>
          )}

          {isActive && (
            <div className="rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">
              Your trip is happening now.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="px-3 pt-3 pb-4">
            <div className="text-xs text-muted-foreground">Activities</div>
            <div className="mt-1 text-xl font-semibold">
              {completedActivities}/{activities?.length || 0}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">done</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-3 pt-3 pb-4">
            <div className="text-xs text-muted-foreground">Participants</div>
            <div className="mt-1 text-xl font-semibold">
              {participants?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-3 pt-3 pb-4">
            <div className="text-xs text-muted-foreground">Budget</div>
            <div className="mt-1 text-lg font-semibold leading-tight">
              {formatCurrency(
                activities?.reduce((s, a) => s + (a.estimated_cost || 0), 0) ||
                  0,
                journey.currency,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Activities</CardTitle>
              <CardAction>
                <Button asChild>
                  <Link href={`/journeys/${id}/activities/new`}>
                    <Plus className="size-4" />
                    Add Activity
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {activities && activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => {
                    const scheduledAt = activity.scheduled_at
                      ? new Date(activity.scheduled_at)
                      : null;

                    return (
                      <Card key={activity.id} size="sm">
                        <CardContent>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {activity.title}
                                </h3>
                                {activity.cost_paid && (
                                  <Badge className="bg-emerald-100 text-emerald-700">
                                    Paid
                                  </Badge>
                                )}
                              </div>
                              {activity.location && (
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <MapPin className="size-3.5" />
                                  {activity.location}
                                </p>
                              )}
                              {activity.estimated_cost !== undefined &&
                                activity.estimated_cost !== null && (
                                  <div className="mt-2 text-sm text-foreground">
                                    <p
                                      className={
                                        activity.cost_paid
                                          ? 'line-through opacity-60'
                                          : ''
                                      }
                                    >
                                      <CircleDollarSign className="mr-1 inline size-3.5 text-muted-foreground" />
                                      Estimated:{' '}
                                      {formatCurrency(
                                        activity.estimated_cost,
                                        journey.currency,
                                      )}
                                    </p>
                                    {activity.cost_split_type === 'equal' && (
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        Split equally among participants
                                      </p>
                                    )}
                                    {activity.cost_split_type ===
                                      'individual' && (
                                      <div className="mt-2 rounded-lg border bg-muted/40 p-2">
                                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                                          Individual costs:
                                        </p>
                                        <ActivityCostBreakdown
                                          activityId={activity.id}
                                          currency={journey.currency}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                            {activity.completed_at && (
                              <Check className="size-4 text-emerald-600" />
                            )}
                          </div>

                          {activity.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                            {scheduledAt && (
                              <div className="flex items-center gap-1.5">
                                <CalendarClock className="size-3.5" />
                                {scheduledAt.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}{' '}
                                at{' '}
                                {scheduledAt.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                            {activity.category && (
                              <Badge variant="secondary">
                                {activity.category}
                              </Badge>
                            )}
                          </div>

                          <Separator className="mb-2" />
                          <div className="flex gap-2">
                            {activity.estimated_cost &&
                              activity.estimated_cost > 0 && (
                                <MarkActivityPaid
                                  activityId={activity.id}
                                  initialPaidStatus={activity.cost_paid}
                                />
                              )}
                            <Button asChild variant="ghost" className="flex-1 min-h-[44px]">
                              <Link
                                href={`/journeys/${id}/activities/${activity.id}/edit`}
                              >
                                <Pencil className="size-4" />
                                Edit
                              </Link>
                            </Button>
                            <DeleteActivityButton activityId={activity.id} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="mx-auto mb-3 size-8 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm mb-4">
                    No activities planned yet
                  </p>
                  <Button asChild>
                    <Link href={`/journeys/${id}/activities/new`}>
                      Add Your First Activity
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Participants</CardTitle>
            </CardHeader>
            <CardContent>
              {participants && participants.length > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {participants.map((participant) => {
                      const profile = participant.profiles;

                      return (
                        <div
                          key={participant.id}
                          className="flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                            {profile?.full_name?.[0]?.toUpperCase() ||
                              profile?.email?.[0]?.toUpperCase() ||
                              '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {profile?.full_name || 'Unknown'}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {profile?.email}
                            </div>
                          </div>
                          {participant.role === 'owner' && (
                            <Badge variant="secondary">Owner</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Separator className="mb-4" />
                  <div>
                    <JourneyParticipantCostSummary
                      journeyId={id}
                      participants={participants
                        .map((p) => p.profiles)
                        .filter((p): p is Profile => p !== null)}
                      currency={journey.currency}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Users className="mx-auto mb-3 size-8 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    Just you on this journey
                  </p>
                </div>
              )}

              <InviteParticipant journeyId={id} />
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="secondary" className="w-full">
                  <Link href={`/journeys/${id}/edit`}>
                    <Pencil className="size-4" />
                    Edit Journey
                  </Link>
                </Button>
                <DeleteJourneyButton journeyId={id} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
