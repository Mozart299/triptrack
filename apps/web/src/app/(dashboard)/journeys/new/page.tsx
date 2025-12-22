import Link from 'next/link';
import JourneyForm from '@/components/features/JourneyForm';

export default function NewJourneyPage() {
  return (
    <div className="container-app py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Journey
          </h1>
          <JourneyForm />
        </div>
      </div>
    </div>
  );
}