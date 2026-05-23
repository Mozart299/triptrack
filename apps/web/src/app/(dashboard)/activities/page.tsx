import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SearchX, ListTodo, Plane, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ActivityCheckIn from '@/components/features/ActivityCheckIn';
import ActivityFilters from '@/components/features/ActivityFilters';
import ActivityRow from '@/components/features/ActivityRow';
import JourneySwitcher from '@/components/features/JourneySwitcher';
import { formatCurrency } from '@/lib/currency';
import type { Activity } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

interface ActivitiesPageProps {
  searchParams: Promise<{ journey?: string; search?: string; category?: string }>;
}

function groupActivitiesByDate(
  activities: Activity[],
  dateField: 'scheduled_at' | 'completed_at',
) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const groups = new Map<string, { date: Date; activities: Activity[] }>();

  activities.forEach((activity) => {
    const value = activity[dateField];
    if (!value) return;

    const date = new Date(value);
    const key = date.toDateString();
    const existing = groups.get(key);

    if (existing) {
      existing.activities.push(activity);
    } else {
      groups.set(key, { date, activities: [activity] });
    }
  });

  return Array.from(groups.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((group) => ({
      label: formatter.format(group.date),
      activities: group.activities,
    }));
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

  const { journey: journeyParam, search, category } = await searchParams;

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

  const now = new Date();
  const selectedJourney = journeyParam
    ? journeys.find((j) => j.id === journeyParam)
    : null;
  const activeJourney = journeys.find((j) => {
    const start = new Date(j.start_date);
    const end = new Date(j.end_date);
    return now >= start && now <= end;
  });
  const nextJourney = journeys
    .filter((j) => new Date(j.start_date) > now)
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    )[0];
  const journey = selectedJourney || activeJourney || nextJourney || journeys[0];

  let activitiesQuery = supabase
    .from('activities')
    .select('*')
    .eq('journey_id', journey.id)
    .order('scheduled_at', { ascending: true });

  if (search) activitiesQuery = activitiesQuery.ilike('title', `%${search}%`);
  if (category) activitiesQuery = activitiesQuery.eq('category', category);

  const { data: activities } = await activitiesQuery;

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
  const hasFilters = Boolean(search || category);
  const hasActivities = Boolean(activities && activities.length > 0);
  const upcomingGroups = groupActivitiesByDate(upcoming ?? [], 'scheduled_at');
  const completedGroups = groupActivitiesByDate(completed ?? [], 'completed_at');

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

      <ActivityFilters journeyId={journey.id} />

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
              <ActivityRow key={activity.id} activity={activity} journeyId={journey.id} currency={journey.currency} />
            ))}
          </div>
        </div>
      )}

      {upcoming && upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Upcoming</h2>
          <div className="space-y-5">
            {upcomingGroups.map((group) => (
              <div key={group.label} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {group.label}
                </h3>
                {group.activities.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    journeyId={journey.id}
                    currency={journey.currency}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {completed && completed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Completed</h2>
          <div className="space-y-5">
            {completedGroups.map((group) => (
              <div key={group.label} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {group.label}
                </h3>
                {group.activities.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    journeyId={journey.id}
                    currency={journey.currency}
                    completedItem
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {activities && activities.length === 0 && hasFilters && (
        <Card className="text-center">
          <CardContent className="py-12">
            <SearchX className="mx-auto mb-4 size-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No matching activities</h3>
            <p className="mt-2 text-muted-foreground">
              Try clearing your search or category filter.
            </p>
            <Button asChild variant="secondary" className="mt-6">
              <Link href={`/activities?journey=${journey.id}`}>
                Clear Filters
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {activities && !hasActivities && !hasFilters && (
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
