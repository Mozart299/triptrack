import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import JourneyForm from '@/components/features/JourneyForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface EditJourneyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJourneyPage({
  params,
}: EditJourneyPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

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
        <Button asChild variant="ghost" className="mb-6 px-0">
          <Link href={`/journeys/${id}`}>
            <ArrowLeft className="size-4" />
            Back to Journey
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Journey</CardTitle>
            <CardDescription>
              Update the trip details your group sees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JourneyForm initialData={journey} journeyId={id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
