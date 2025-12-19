import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ActivityCheckIn from '@/components/features/ActivityCheckIn';

export default async function ActivitiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's active or most recent journey
  const { data: journeys } = await supabase
    .from('journeys')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })
    .limit(1);

  const journey = journeys?.[0];

  if (!journey) {
    return (
      <div className="container-app py-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Journey Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create a journey to start adding activities
          </p>
          <Link href="/journeys/new" className="btn-primary inline-block">
            Create Journey
          </Link>
        </div>
      </div>
    );
  }

  // Get activities for this journey
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('journey_id', journey.id)
    .order('scheduled_at', { ascending: true });

  const now = new Date();
  const upcoming = activities?.filter(
    (a) => !a.completed_at && new Date(a.scheduled_at || '') > now
  );
  const ongoing = activities?.filter(
    (a) => !a.completed_at && new Date(a.scheduled_at || '') <= now
  );
  const completed = activities?.filter((a) => a.completed_at);

  return (
    <div className="container-app py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Activities</h1>
        <p className="text-gray-600">{journey.title}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">
            {completed?.length || 0}
          </p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">
            {ongoing?.length || 0}
          </p>
          <p className="text-sm text-gray-600">Ongoing</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-600">
            {upcoming?.length || 0}
          </p>
          <p className="text-sm text-gray-600">Upcoming</p>
        </div>
      </div>

      {/* Ongoing Activities */}
      {ongoing && ongoing.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Happening Now
          </h2>
          <div className="space-y-3">
            {ongoing.map((activity) => (
              <ActivityCheckIn key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Activities */}
      {upcoming && upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((activity) => (
              <div key={activity.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {activity.category === 'dining'
                          ? '🍽️'
                          : activity.category === 'accommodation'
                          ? '🏨'
                          : activity.category === 'transport'
                          ? '🚗'
                          : activity.category === 'sightseeing'
                          ? '🏛️'
                          : activity.category === 'entertainment'
                          ? '🎭'
                          : '📍'}
                      </span>
                      <h3 className="font-semibold text-gray-900">
                        {activity.title}
                      </h3>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.description}
                      </p>
                    )}
                    {activity.location && (
                      <p className="text-xs text-gray-500">
                        📍 {activity.location}
                      </p>
                    )}
                    {activity.scheduled_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        🕒{' '}
                        {new Date(activity.scheduled_at).toLocaleString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Activities */}
      {completed && completed.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Completed</h2>
          <div className="space-y-3">
            {completed.map((activity) => (
              <div key={activity.id} className="card opacity-60">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-through">
                      {activity.title}
                    </h3>
                    {activity.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {activity.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activities && activities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No activities yet
          </h3>
          <p className="text-gray-600">
            Add activities to your journey to track them here
          </p>
        </div>
      )}
    </div>
  );
}
