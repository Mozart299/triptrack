'use client';

import { Profile } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ParticipantCost {
  userId: string;
  amount: number;
  notes?: string;
}

interface ParticipantCostInputProps {
  participants: Profile[];
  costs: ParticipantCost[];
  onChange: (costs: ParticipantCost[]) => void;
  currency: string;
}

export default function ParticipantCostInput({
  participants,
  costs,
  onChange,
  currency,
}: ParticipantCostInputProps) {
  const handleAmountChange = (userId: string, amount: string) => {
    const numAmount = amount === '' ? 0 : parseFloat(amount);
    const existingCostIndex = costs.findIndex((c) => c.userId === userId);

    if (existingCostIndex >= 0) {
      const newCosts = [...costs];
      newCosts[existingCostIndex] = {
        ...newCosts[existingCostIndex],
        amount: numAmount,
      };
      onChange(newCosts);
    } else {
      onChange([...costs, { userId, amount: numAmount }]);
    }
  };

  const handleNotesChange = (userId: string, notes: string) => {
    const existingCostIndex = costs.findIndex((c) => c.userId === userId);

    if (existingCostIndex >= 0) {
      const newCosts = [...costs];
      newCosts[existingCostIndex] = {
        ...newCosts[existingCostIndex],
        notes,
      };
      onChange(newCosts);
    } else {
      onChange([...costs, { userId, amount: 0, notes }]);
    }
  };

  const getCost = (userId: string) => {
    return costs.find((c) => c.userId === userId);
  };

  const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <Label>Individual Participant Costs</Label>
        {totalCost > 0 && (
          <span className="text-sm font-semibold text-primary">
            Total: {currency} {totalCost.toFixed(2)}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {participants.map((participant) => {
          const cost = getCost(participant.id);
          return (
            <div
              key={participant.id}
              className="rounded-lg border bg-muted/30 p-3 sm:p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {participant.full_name || participant.email}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {participant.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <span className="text-sm text-muted-foreground">
                    {currency}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cost?.amount || ''}
                    onChange={(e) =>
                      handleAmountChange(participant.id, e.target.value)
                    }
                    placeholder="0.00"
                    className="min-h-[44px] w-full text-right sm:w-28 md:w-32"
                  />
                </div>
              </div>
              <Input
                type="text"
                value={cost?.notes || ''}
                onChange={(e) =>
                  handleNotesChange(participant.id, e.target.value)
                }
                placeholder="Notes (optional)"
                className="min-h-[44px] w-full text-sm"
              />
            </div>
          );
        })}
      </div>

      {participants.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          No participants in this journey yet. Individual costs can be set when
          participants are added.
        </p>
      )}
    </div>
  );
}
