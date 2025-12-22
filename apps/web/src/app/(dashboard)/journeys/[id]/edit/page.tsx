import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import JourneyForm from '@/components/features/JourneyForm';

interface EditJourneyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJourneyPage({ params }: EditJourneyPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch Journey
  const { data: journey, error } = await supabase
    .from('journeys')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !journey) notFound();


  if (journey.user_id !== user.id) {
    redirect(`/journeys/${id}`);
  }

  return (
    <div className="container-app py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/journeys/${id}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            ← Back to Journey
          </Link>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Journey
          </h1>
          
          <JourneyForm initialData={journey} journeyId={id} />
        </div>
      </div>
    </div>
  );
}