import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarClock,
  Check,
  CircleDollarSign,
  ListTodo,
  MapPin,
  Plane,
  Plus,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ActivityCheckIn from '@/components/features/ActivityCheckIn';
import ActivityActions from '@/components/features/ActivityActions';
import ActivityCostBreakdown from '@/components/features/ActivityCostBreakdown';
import DeleteActivityButton from '@/components/features/DeleteActivityButton';
import JourneySwitcher from '@/components/features/JourneySwitcher';
import MarkActivityPaid from '@/components/features/MarkActivityPaid';
import UndoCheckIn from '@/components/features/UndoCheckIn';
import { formatCurrency } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

interface ActivitiesPageProps {
  searchParams: Promise<{ journey?: string }>;
}

export default async function ActivitiesPage({
  searchParams,
}: ActivitiesPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { journey: journeyParam } = await searchParams;

  const { data: journeys } = await supabase
    .from('journeys')
    .select('*')
    .order('start_date', { ascending: false });

  if (!journeys || journeys.length === 0) {
    return (
      <div className="container-app py-8">
        <Card className="text-center">
          <CardContent className="py-12">
            <Plane className="mx-auto mb-4 size-10 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">No Journey Yet</h2>
            <p className="mt-2 text-muted-foreground">
              Create a journey to start adding activities
            </p>
            <Button asChild className="mt-6">
              <Link href="/journeys/new">Create Journey</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const journey =
    (journeyParam && journeys.find((j) => j.id === journeyParam)) ||
    journeys[0];

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('journey_id', journey.id)
    .order('scheduled_at', { ascending: true });

  const now = new Date();

  const upcoming = activities?.filter((a) => {
    if (a.completed_at) return false;
    if (!a.scheduled_at) return false;
    return new Date(a.scheduled_at) > now;
  });

  const ongoing = activities?.filter((a) => {
    if (a.completed_at) return false;
    if (!a.scheduled_at) return false;
    return new Date(a.scheduled_at) <= now;
  });

  const unscheduled = activities?.filter(
    (a) => !a.completed_at && !a.scheduled_at,
  );

  const completed = activities?.filter((a) => a.completed_at);

  const ActivityRow = ({
    activity,
    completedItem = false,
  }: {
    activity: NonNullable<typeof activities>[number];
    completedItem?: boolean;
  }) => (
    <Card className={completedItem ? 'opacity-70' : undefined}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {completedItem && <Check className="size-4 text-emerald-600" />}
              <h3
                className={`font-medium ${completedItem ? 'line-through' : ''}`}
              >
                {activity.title}
              </h3>
              {activity.category && (
                <Badge variant="secondary">{activity.category}</Badge>
              )}
              {activity.cost_paid && (
                <Badge className="bg-emerald-100 text-emerald-700">Paid</Badge>
              )}
            </div>
            {activity.description && !completedItem && (
              <p className="mb-2 text-sm text-muted-foreground">
                {activity.description}
              </p>
            )}
            {activity.location && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {activity.location}
              </p>
            )}
            {activity.scheduled_at && !completedItem && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                {new Date(activity.scheduled_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            )}
            {activity.estimated_cost !== undefined &&
              activity.estimated_cost !== null &&
              !completedItem && (
                <div className="mt-2 text-sm">
                  <p
                    className={
                      activity.cost_paid ? 'line-through opacity-60' : ''
                    }
                  >
                    <CircleDollarSign className="mr-1 inline size-3.5 text-muted-foreground" />
                    Estimated:{' '}
                    {formatCurrency(activity.estimated_cost, journey.currency)}
                  </p>
                  {activity.cost_split_type === 'equal' && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Split equally among participants
                    </p>
                  )}
                  {activity.cost_split_type === 'individual' && (
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
        </div>
        <div className="mt-3 flex gap-2">
          {activity.estimated_cost && activity.estimated_cost > 0 && (
            <MarkActivityPaid
              activityId={activity.id}
              initialPaidStatus={activity.cost_paid}
            />
          )}
          {completedItem ? (
            <>
              <UndoCheckIn activityId={activity.id} />
              <DeleteActivityButton activityId={activity.id} />
            </>
          ) : (
            <ActivityActions activityId={activity.id} journeyId={journey.id} />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activities</h1>
          <p className="mt-1 text-muted-foreground">{journey.title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {journeys.length > 1 && (
            <JourneySwitcher
              journeys={journeys.map((j) => ({ id: j.id, title: j.title }))}
              selectedJourneyId={journey.id}
            />
          )}
          <Button asChild size="lg">
            <Link href={`/journeys/${journey.id}/activities/new`}>
              <Plus className="size-4" />
              <span className="hidden sm:inline">Add Activity</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-semibold">{completed?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-semibold text-primary">
              {ongoing?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Ongoing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-semibold">{upcoming?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-lg font-semibold leading-tight">
              {formatCurrency(
                activities?.reduce(
                  (sum, a) => sum + (a.estimated_cost || 0),
                  0,
                ) || 0,
                journey.currency,
              )}
            </p>
            <p className="text-xs text-muted-foreground">Budget</p>
          </CardContent>
        </Card>
      </div>

      {ongoing && ongoing.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Ready to Check In</h2>
          <div className="space-y-3">
            {ongoing.map((activity) => (
              <ActivityCheckIn
                key={activity.id}
                activity={activity}
                currency={journey.currency}
              />
            ))}
          </div>
        </div>
      )}

      {unscheduled && unscheduled.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Unscheduled</h2>
          <div className="space-y-3">
            {unscheduled.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {upcoming && upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {completed && completed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Completed</h2>
          <div className="space-y-3">
            {completed.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                completedItem
              />
            ))}
          </div>
        </div>
      )}

      {activities && activities.length === 0 && (
        <Card className="text-center">
          <CardContent className="py-12">
            <ListTodo className="mx-auto mb-4 size-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No activities yet</h3>
            <p className="mt-2 text-muted-foreground">
              Add your first activity to start planning
            </p>
            <Button asChild className="mt-6">
              <Link href={`/journeys/${journey.id}/activities/new`}>
                <Plus className="size-4" />
                Add Activity
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
