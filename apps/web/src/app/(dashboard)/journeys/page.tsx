import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function JourneysPage() {
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

  return (
    <div className="container-app py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            My Journeys
          </h1>
          <p className="text-gray-600">
            All your trips in one place
          </p>
        </div>
        <Link
          href="/journeys/new"
          className="btn-primary"
        >
          + New Journey
        </Link>
      </div>

      {journeys && journeys.length > 0 ? (
        <div className="space-y-4">
          {journeys.map((journey) => {
            const startDate = new Date(journey.start_date);
            const endDate = new Date(journey.end_date);
            const today = new Date();
            const isActive = today >= startDate && today <= endDate;
            const isCompleted = today > endDate;
            const daysUntil = Math.ceil(
              (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <Link
                key={journey.id}
                href={`/journeys/${journey.id}`}
                className="card hover:shadow-lg transition-shadow block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {journey.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {journey.destination}
                    </p>
                    <p className="text-xs text-gray-500">
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
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : isCompleted
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isActive
                      ? 'Active'
                      : isCompleted
                      ? 'Completed'
                      : 'Planning'}
                  </span>
                </div>

                {journey.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {journey.description}
                  </p>
                )}

                {!isCompleted && !isActive && daysUntil > 0 && (
                  <div className="bg-primary-50 px-3 py-2 rounded-lg">
                    <p className="text-sm text-primary-700">
                      🕒 Starts in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {isActive && (
                  <div className="bg-green-50 px-3 py-2 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✨ Trip is happening now!
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No journeys yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first journey to start tracking your adventure
          </p>
          <Link href="/journeys/new" className="btn-primary inline-block">
            Create Your First Journey
          </Link>
        </div>
      )}
    </div>
  );
}
