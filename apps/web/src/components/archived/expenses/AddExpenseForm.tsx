'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { JourneyParticipant } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <div className="space-y-2">
        <Label htmlFor="title">Description</Label>
        <Input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Dinner downtown"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            type="number"
            id="amount"
            step="0.01"
            value={formData.amount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, amount: e.target.value }))
            }
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          type="text"
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Any additional details..."
        />
      </div>

      {participants.length > 1 && (
        <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
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
            className="size-4 rounded accent-primary"
          />
          <Label htmlFor="splitEqually">
            Split equally among all {participants.length} participants
          </Label>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? 'Adding...' : 'Add Expense'}
      </Button>
    </form>
  );
}
