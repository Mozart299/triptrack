import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Plane,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
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

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's journeys
  const { data: journeys } = await supabase
    .from('journeys')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false });

  // Fetch active journey
  const activeJourney = journeys?.find((j) => j.status === 'active');

  // Get stats for active journey
  let stats = null;
  if (activeJourney) {
    const activitiesResult = await supabase
      .from('activities')
      .select('*')
      .eq('journey_id', activeJourney.id);

    const completedActivities =
      activitiesResult.data?.filter((a) => a.completed_at)?.length || 0;

    stats = {
      totalActivities: activitiesResult.data?.length || 0,
      completedActivities,
    };
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-primary">
            Trip workspace
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Welcome back, {user.user_metadata?.full_name || 'Traveler'}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            {activeJourney
              ? `Your ${activeJourney.destination} trip is in progress`
              : 'Ready to start your next adventure?'}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/journeys/new">New Journey</Link>
        </Button>
      </div>

      {activeJourney && stats ? (
        <Card className="mb-6 border-primary/20 bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-xl">{activeJourney.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-primary-foreground/75">
              <MapPin className="size-4" />
              {activeJourney.destination}
            </CardDescription>
            <CardAction>
              <Badge className="bg-white/15 text-primary-foreground">
                Active
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm text-primary-foreground/70">Activities</p>
                <p className="mt-1 text-2xl font-semibold">
                  {stats.completedActivities}/{stats.totalActivities}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm text-primary-foreground/70">Days Left</p>
                <p className="mt-1 text-2xl font-semibold">
                  {Math.ceil(
                    (new Date(activeJourney.end_date).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24),
                  )}
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="secondary"
              className="mt-6 w-full"
              size="lg"
            >
              <Link href={`/journeys/${activeJourney.id}`}>
                View Journey Details
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 text-center">
          <CardContent className="py-10">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-secondary text-primary">
              <Plane className="size-6" />
            </div>
            <h3 className="text-lg font-semibold">No active journey</h3>
            <p className="mt-2 text-muted-foreground">
              Create your first journey to start tracking
            </p>
            <Button asChild className="mt-5">
              <Link href="/journeys/new">Create Journey</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="transition-colors hover:bg-accent/50">
          <Link href="/activities" className="block">
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <MapPin className="size-4" />
              </div>
              <CardTitle>Activities</CardTitle>
              <CardDescription>Check in and keep plans current</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {journeys && journeys.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Journeys</h2>
            <Button asChild variant="ghost">
              <Link href="/journeys">View All</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {journeys.slice(0, 3).map((journey) => (
              <Card
                key={journey.id}
                className="transition-colors hover:bg-accent/50"
              >
                <Link
                  href={`/journeys/${journey.id}`}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <h3 className="font-medium">{journey.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {journey.destination}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {new Date(journey.start_date).toLocaleDateString()} -{' '}
                      {new Date(journey.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      journey.status === 'active' ? 'default' : 'secondary'
                    }
                    className={
                      journey.status === 'completed'
                        ? 'bg-muted text-muted-foreground'
                        : ''
                    }
                  >
                    {journey.status === 'active' && (
                      <CheckCircle2 className="size-3" />
                    )}
                    {journey.status}
                  </Badge>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
