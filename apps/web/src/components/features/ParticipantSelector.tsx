'use client';

import { Profile } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ParticipantSelectorProps {
  participants: Profile[];
  selectedParticipants: string[];
  onChange: (selectedIds: string[]) => void;
  estimatedCost?: number;
  currency: string;
}

export default function ParticipantSelector({
  participants,
  selectedParticipants,
  onChange,
  estimatedCost,
  currency,
}: ParticipantSelectorProps) {
  const handleToggle = (userId: string) => {
    if (selectedParticipants.includes(userId)) {
      onChange(selectedParticipants.filter((id) => id !== userId));
    } else {
      onChange([...selectedParticipants, userId]);
    }
  };

  const handleSelectAll = () => {
    onChange(participants.map((p) => p.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const costPerPerson =
    estimatedCost && selectedParticipants.length > 0
      ? estimatedCost / selectedParticipants.length
      : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Label>Split Cost Among</Label>
        <div className="flex gap-2 sm:gap-3">
          <Button
            type="button"
            onClick={handleSelectAll}
            variant="ghost"
            size="sm"
          >
            Select All
          </Button>
          <Button
            type="button"
            onClick={handleClearAll}
            variant="ghost"
            size="sm"
          >
            Clear
          </Button>
        </div>
      </div>

      {selectedParticipants.length > 0 &&
        estimatedCost &&
        estimatedCost > 0 && (
          <div className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground sm:px-4 sm:py-3">
            <span className="font-medium">
              {currency} {costPerPerson.toFixed(2)} per person
            </span>
            <span className="ml-2 block text-muted-foreground sm:inline">
              ({selectedParticipants.length}{' '}
              {selectedParticipants.length === 1
                ? 'participant'
                : 'participants'}
              )
            </span>
          </div>
        )}

      <div className="space-y-2">
        {participants.map((participant) => {
          const isSelected = selectedParticipants.includes(participant.id);
          return (
            <label
              key={participant.id}
              className={`flex min-h-[44px] cursor-pointer flex-col gap-2 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center sm:gap-3 sm:p-4 ${
                isSelected
                  ? 'border-primary bg-secondary'
                  : 'bg-muted/30 hover:bg-muted/60'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(participant.id)}
                  className="size-5 shrink-0 rounded accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {participant.full_name || participant.email}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {participant.email}
                  </p>
                </div>
              </div>
              {isSelected && estimatedCost && estimatedCost > 0 && (
                <span className="pl-8 text-sm font-semibold text-primary sm:shrink-0 sm:pl-0">
                  {currency} {costPerPerson.toFixed(2)}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {participants.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          No participants in this journey yet. Add participants to split costs.
        </p>
      )}

      {selectedParticipants.length === 0 && participants.length > 0 && (
        <p className="text-center text-sm text-amber-600 py-2">
          Please select at least one participant to split the cost
        </p>
      )}
    </div>
  );
}
