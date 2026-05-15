'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    <Select
      value={selectedJourneyId}
      onValueChange={(id) => router.push(`/activities?journey=${id}`)}
    >
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {journeys.map((j) => (
          <SelectItem key={j.id} value={j.id}>
            {j.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
