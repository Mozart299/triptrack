import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import JourneyForm from '@/components/features/JourneyForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NewJourneyPage() {
  return (
    <div className="container-app py-6">
      <div className="max-w-2xl mx-auto">
        <Button asChild variant="ghost" className="mb-6 px-0">
          <Link href="/dashboard">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Journey</CardTitle>
            <CardDescription>
              Set the destination, dates, and default currency for this trip.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JourneyForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
