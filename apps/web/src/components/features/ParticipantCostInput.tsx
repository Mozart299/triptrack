'use client';

import { Profile } from '@/types';

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
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Individual Participant Costs
        </label>
        {totalCost > 0 && (
          <span className="text-sm font-semibold text-primary-700">
            Total: {currency} {totalCost.toFixed(2)}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {participants.map((participant) => {
          const cost = getCost(participant.id);
          return (
            <div
              key={participant.id}
              className="bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {participant.full_name || participant.email}
                  </p>
                  <p className="text-xs text-gray-500">{participant.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cost?.amount || ''}
                    onChange={(e) =>
                      handleAmountChange(participant.id, e.target.value)
                    }
                    placeholder="0.00"
                    className="input w-24 text-right"
                  />
                </div>
              </div>
              <input
                type="text"
                value={cost?.notes || ''}
                onChange={(e) => handleNotesChange(participant.id, e.target.value)}
                placeholder="Notes (optional)"
                className="input text-sm w-full"
              />
            </div>
          );
        })}
      </div>

      {participants.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No participants in this journey yet. Individual costs can be set when
          participants are added.
        </p>
      )}
    </div>
  );
}
