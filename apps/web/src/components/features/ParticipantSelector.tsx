'use client';

import { Profile } from '@/types';

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
        <label className="block text-sm font-medium text-gray-700">
          Split Cost Among
        </label>
        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 min-h-[44px] px-2"
          >
            Select All
          </button>
          <span className="text-gray-400">|</span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs sm:text-sm text-gray-600 hover:text-gray-700 min-h-[44px] px-2"
          >
            Clear
          </button>
        </div>
      </div>

      {selectedParticipants.length > 0 && estimatedCost && estimatedCost > 0 && (
        <div className="bg-primary-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
          <span className="font-medium text-primary-900">
            {currency} {costPerPerson.toFixed(2)} per person
          </span>
          <span className="text-primary-700 ml-2 block sm:inline mt-1 sm:mt-0">
            ({selectedParticipants.length} {selectedParticipants.length === 1 ? 'participant' : 'participants'})
          </span>
        </div>
      )}

      <div className="space-y-2">
        {participants.map((participant) => {
          const isSelected = selectedParticipants.includes(participant.id);
          return (
            <label
              key={participant.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-colors min-h-[44px] ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(participant.id)}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {participant.full_name || participant.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{participant.email}</p>
                </div>
              </div>
              {isSelected && estimatedCost && estimatedCost > 0 && (
                <span className="text-sm font-semibold text-primary-700 sm:shrink-0 pl-8 sm:pl-0">
                  {currency} {costPerPerson.toFixed(2)}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {participants.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No participants in this journey yet. Add participants to split costs.
        </p>
      )}

      {selectedParticipants.length === 0 && participants.length > 0 && (
        <p className="text-sm text-amber-600 text-center py-2">
          Please select at least one participant to split the cost
        </p>
      )}
    </div>
  );
}
