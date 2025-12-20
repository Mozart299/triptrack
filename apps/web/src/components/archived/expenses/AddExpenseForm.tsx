'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { JourneyParticipant } from '@/types';

interface AddExpenseFormProps {
  journeyId: string;
  participants: (JourneyParticipant & { profiles: any })[];
  userId: string;
}

export default function AddExpenseForm({
  journeyId,
  participants,
  userId,
}: AddExpenseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'other',
    notes: '',
    splitEqually: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    // Calculate split
    const splitWith = formData.splitEqually
      ? participants
          .filter((p) => p.profiles.id !== userId)
          .map((p) => p.profiles.id)
      : [];

    const { error } = await supabase.from('expenses').insert({
      journey_id: journeyId,
      user_id: userId,
      paid_by: userId,
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      notes: formData.notes || null,
      split_with: splitWith,
      currency: 'USD',
    });

    if (!error) {
      setFormData({
        title: '',
        amount: '',
        category: 'other',
        notes: '',
        splitEqually: true,
      });
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="input-field"
          placeholder="Dinner at Carnivore"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            value={formData.amount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, amount: e.target.value }))
            }
            className="input-field"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            className="input-field"
          >
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="accommodation">Accommodation</option>
            <option value="activities">Activities</option>
            <option value="shopping">Shopping</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes (Optional)
        </label>
        <input
          type="text"
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          className="input-field"
          placeholder="Any additional details..."
        />
      </div>

      {participants.length > 1 && (
        <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg">
          <input
            type="checkbox"
            id="splitEqually"
            checked={formData.splitEqually}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                splitEqually: e.target.checked,
              }))
            }
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="splitEqually" className="text-sm text-gray-700">
            Split equally among all {participants.length} participants
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
}
