'use client';

import { useRouter } from 'next/navigation';

interface Journey {
  id: string;
  title: string;
}

interface JourneySwitcherProps {
  journeys: Journey[];
  selectedJourneyId: string;
}

export default function JourneySwitcher({
  journeys,
  selectedJourneyId,
}: JourneySwitcherProps) {
  const router = useRouter();

  return (
    <select
      value={selectedJourneyId}
      onChange={(e) => router.push(`/activities?journey=${e.target.value}`)}
      className="h-10 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {journeys.map((j) => (
        <option key={j.id} value={j.id}>
          {j.title}
        </option>
      ))}
    </select>
  );
}
