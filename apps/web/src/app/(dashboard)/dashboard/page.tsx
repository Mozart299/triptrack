import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

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
    const [activitiesResult, expensesResult] = await Promise.all([
      supabase
        .from('activities')
        .select('*')
        .eq('journey_id', activeJourney.id),
      supabase
        .from('expenses')
        .select('amount')
        .eq('journey_id', activeJourney.id),
    ]);

    const completedActivities =
      activitiesResult.data?.filter((a) => a.completed_at)?.length || 0;
    const totalExpenses =
      expensesResult.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    stats = {
      totalActivities: activitiesResult.data?.length || 0,
      completedActivities,
      totalExpenses,
    };
  }

  return (
    <div className="container-app py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.user_metadata?.full_name || 'Traveler'}!
        </h1>
        <p className="text-gray-600">
          {activeJourney
            ? `Your ${activeJourney.destination} trip is in progress`
            : 'Ready to start your next adventure?'}
        </p>
      </div>

      {/* Active Journey Card */}
      {activeJourney && stats ? (
        <div className="card mb-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">{activeJourney.title}</h2>
              <p className="text-primary-100">{activeJourney.destination}</p>
            </div>
            <span className="bg-white text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
              Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-primary-100 text-sm mb-1">Activities</p>
              <p className="text-2xl font-bold">
                {stats.completedActivities}/{stats.totalActivities}
              </p>
            </div>
            <div>
              <p className="text-primary-100 text-sm mb-1">Expenses</p>
              <p className="text-2xl font-bold">
                ${stats.totalExpenses.toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-primary-100 text-sm mb-1">Days Left</p>
              <p className="text-2xl font-bold">
                {Math.ceil(
                  (new Date(activeJourney.end_date).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )}
              </p>
            </div>
          </div>

          <Link
            href={`/journeys/${activeJourney.id}`}
            className="block mt-6 bg-white text-primary-600 text-center py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            View Journey Details
          </Link>
        </div>
      ) : (
        <div className="card mb-6 text-center py-8">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No active journey
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first journey to start tracking
          </p>
          <Link href="/journeys/new" className="btn-primary inline-block">
            Create Journey
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link
          href="/activities"
          className="card hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-2">📍</div>
          <h3 className="font-semibold text-gray-900 mb-1">Activities</h3>
          <p className="text-sm text-gray-600">Check-in to activities</p>
        </Link>
        <Link
          href="/expenses"
          className="card hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-2">💰</div>
          <h3 className="font-semibold text-gray-900 mb-1">Expenses</h3>
          <p className="text-sm text-gray-600">Track spending</p>
        </Link>
      </div>

      {/* Recent Journeys */}
      {journeys && journeys.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Journeys</h2>
            <Link
              href="/journeys"
              className="text-primary-600 text-sm font-medium hover:text-primary-700"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {journeys.slice(0, 3).map((journey) => (
              <Link
                key={journey.id}
                href={`/journeys/${journey.id}`}
                className="card hover:shadow-md transition-shadow flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {journey.title}
                  </h3>
                  <p className="text-sm text-gray-600">{journey.destination}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(journey.start_date).toLocaleDateString()} -{' '}
                    {new Date(journey.end_date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    journey.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : journey.status === 'completed'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {journey.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
