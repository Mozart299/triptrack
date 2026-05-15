'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ActivityFiltersProps {
  journeyId: string;
}

export default function ActivityFilters({ journeyId }: ActivityFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.set('journey', journeyId);
      router.replace(`/activities?${params.toString()}`);
    },
    [router, searchParams, journeyId],
  );

  const hasFilters =
    !!searchParams.get('search') || !!searchParams.get('category');

  const clearFilters = () => {
    router.replace(`/activities?journey=${journeyId}`);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <div className="relative flex-1" style={{ minWidth: '180px' }}>
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search activities..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(e) => updateParam('search', e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={searchParams.get('category') ?? 'all'}
        onValueChange={(v) => updateParam('category', v === 'all' ? '' : v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          <SelectItem value="transport">Transport</SelectItem>
          <SelectItem value="accommodation">Accommodation</SelectItem>
          <SelectItem value="dining">Dining</SelectItem>
          <SelectItem value="sightseeing">Sightseeing</SelectItem>
          <SelectItem value="entertainment">Entertainment</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="size-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
