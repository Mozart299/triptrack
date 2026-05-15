import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, Clock, MapPin, Plane, Plus, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function JourneysPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: journeys } = await supabase
    .from('journeys')
    .select('*')
    .order('start_date', { ascending: false });

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Journeys</h1>
          <p className="mt-1 text-muted-foreground">
            All your trips in one place
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/journeys/new">
            <Plus className="size-4" />
            New Journey
          </Link>
        </Button>
      </div>

      {journeys && journeys.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {journeys.map((journey) => {
            const startDate = new Date(journey.start_date);
            const endDate = new Date(journey.end_date);
            const today = new Date();
            const isActive = today >= startDate && today <= endDate;
            const isCompleted = today > endDate;
            const daysUntil = Math.ceil(
              (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );

            // Check ownership for the UI badge
            const isOwner = journey.user_id === user.id;

            return (
              <Card
                key={journey.id}
                className="transition-colors hover:bg-accent/50"
              >
                <Link href={`/journeys/${journey.id}`} className="block">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          {journey.title}
                        </CardTitle>
                        <CardDescription className="mt-2 flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          {journey.destination}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={isActive ? 'default' : 'secondary'}
                        className={
                          isCompleted ? 'bg-muted text-muted-foreground' : ''
                        }
                      >
                        {isActive
                          ? 'Active'
                          : isCompleted
                            ? 'Completed'
                            : 'Planning'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!isOwner && (
                      <Badge variant="outline" className="gap-1">
                        <Users className="size-3" />
                        Shared with you
                      </Badge>
                    )}
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {startDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      -{' '}
                      {endDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>

                    {journey.description && (
                      <p className="text-sm text-muted-foreground">
                        {journey.description}
                      </p>
                    )}

                    {!isCompleted && !isActive && daysUntil > 0 && (
                      <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                        <Clock className="size-4" />
                        Starts in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                      </div>
                    )}

                    {isActive && (
                      <div className="rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">
                        Trip is happening now
                      </div>
                    )}
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center">
          <CardContent className="py-16">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-secondary text-primary">
              <Plane className="size-6" />
            </div>
            <h3 className="text-xl font-semibold">No journeys yet</h3>
            <p className="mt-2 text-muted-foreground">
              Create your first journey to start tracking your adventure
            </p>
            <Button asChild className="mt-6">
              <Link href="/journeys/new">Create Your First Journey</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
