import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import InviteParticipant from '@/components/features/InviteParticipant';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types';
import DeleteJourneyButton from '@/components/features/DeleteJourneyButton';
import { formatCurrency } from '@/lib/currency';

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

  const [{ data: activities }, { data: participants }] = await Promise.all([
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
          avatar_url
        )
      `,
      )
      .eq('journey_id', id),
  ]);

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
    <div className="container-app py-6">
      <div className="mb-6">
        <Link
          href="/journeys"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          ← Back to Journeys
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {journey.title}
            </h1>
            <p className="text-lg text-gray-600 mb-3">
              📍 {journey.destination}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Start:</span>{' '}
                {startDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div>
                <span className="font-medium">End:</span>{' '}
                {endDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {tripDuration}{' '}
                day{tripDuration !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              isActive
                ? 'bg-green-100 text-green-700'
                : isCompleted
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-blue-100 text-blue-700'
            }`}
          >
            {isActive ? 'Active' : isCompleted ? 'Completed' : 'Planning'}
          </span>
        </div>

        {journey.description && (
          <div className="mb-4">
            <p className="text-gray-700">{journey.description}</p>
          </div>
        )}

        {!isCompleted && !isActive && daysUntil > 0 && (
          <div className="bg-primary-50 px-4 py-3 rounded-lg">
            <p className="text-sm text-primary-700">
              🕒 Your trip starts in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {isActive && (
          <div className="bg-green-50 px-4 py-3 rounded-lg">
            <p className="text-sm text-green-700">
              ✨ Your trip is happening now! Have an amazing time!
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Activities</div>
          <div className="text-2xl font-bold text-gray-900">
            {completedActivities}/{activities?.length || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">completed</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Participants</div>
          <div className="text-2xl font-bold text-gray-900">
            {participants?.length || 0}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Estimated Budget</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(
              activities?.reduce((s, a) => s + (a.estimated_cost || 0), 0) || 0,
              journey.currency
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Activities</h2>
              <Link
                href={`/journeys/${id}/activities/new`}
                className="btn-primary text-sm"
              >
                + Add Activity
              </Link>
            </div>

            {activities && activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const scheduledAt = activity.scheduled_at
                    ? new Date(activity.scheduled_at)
                    : null;

                  return (
                    <div
                      key={activity.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {activity.title}
                          </h3>
                          {activity.location && (
                            <p className="text-sm text-gray-600 mt-1">
                              📍 {activity.location}
                            </p>
                          )}
                          {activity.estimated_cost !== undefined &&
                            activity.estimated_cost !== null && (
                              <p className="text-sm text-gray-700 mt-2">
                                💵 Estimated: {formatCurrency(activity.estimated_cost, journey.currency)}
                              </p>
                            )}
                        </div>
                        {activity.completed_at && (
                          <span className="text-green-600 text-sm">✓</span>
                        )}
                      </div>

                      {activity.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {activity.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                        {scheduledAt && (
                          <div>
                            🕒{' '}
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
                          <div className="px-2 py-1 bg-gray-100 rounded">
                            {activity.category}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <Link
                          href={`/journeys/${id}/activities/${activity.id}/edit`}
                          className="flex-1 text-center px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-gray-600 text-sm mb-4">
                  No activities planned yet
                </p>
                <Link
                  href={`/journeys/${id}/activities/new`}
                  className="btn-primary text-sm inline-block"
                >
                  Add Your First Activity
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Participants
            </h2>

            {participants && participants.length > 0 ? (
              <div className="space-y-3">
                {participants.map((participant) => {
                  const profile = participant.profiles as unknown as Profile;

                  return (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                        {profile?.full_name?.[0]?.toUpperCase() ||
                          profile?.email?.[0]?.toUpperCase() ||
                          '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {profile?.full_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {profile?.email}
                        </div>
                      </div>
                      {participant.role === 'owner' && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                          Owner
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm">
                  Just you on this journey
                </p>
              </div>
            )}

            <InviteParticipant journeyId={id} />
          </div>

          {isOwner && (
            <div className="card mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link
                  href={`/journeys/${id}/edit`}
                  className="block w-full btn-secondary text-sm text-center"
                >
                  Edit Journey
                </Link>
                <DeleteJourneyButton journeyId={id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
