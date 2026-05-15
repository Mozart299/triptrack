'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { CURRENCIES } from '@/lib/currency';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { isErrorWithMessage } from '@/lib/errors';

interface JourneyFormData {
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  currency: string;
}

interface JourneyFormProps {
  initialData?: JourneyFormData;
  journeyId?: string;
}

export default function JourneyForm({
  initialData,
  journeyId,
}: JourneyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<JourneyFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    destination: initialData?.destination || '',
    currency: initialData?.currency || 'USD',
    start_date: initialData?.start_date
      ? new Date(initialData.start_date).toISOString().split('T')[0]
      : '',
    end_date: initialData?.end_date
      ? new Date(initialData.end_date).toISOString().split('T')[0]
      : '',
  });

  const isEditMode = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in.');
      setLoading(false);
      return;
    }

    try {
      if (isEditMode && journeyId) {
        // --- EDIT MODE ---
        const { error: updateError } = await supabase
          .from('journeys')
          .update({
            title: formData.title,
            description: formData.description,
            destination: formData.destination,
            start_date: formData.start_date,
            end_date: formData.end_date,
            currency: formData.currency,
          })
          .eq('id', journeyId);

        if (updateError) throw updateError;

        router.push(`/journeys/${journeyId}`);
      } else {
        const { data: journey, error: createError } = await supabase
          .from('journeys')
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            destination: formData.destination,
            start_date: formData.start_date,
            end_date: formData.end_date,
            currency: formData.currency,
            status: 'planning',
          })
          .select()
          .single();

        if (createError) throw createError;

        const { error: participantError } = await supabase
          .from('journey_participants')
          .insert({
            journey_id: journey.id,
            user_id: user.id,
            role: 'owner',
          });

        if (participantError) throw participantError;

        router.push(`/journeys/${journey.id}`);
      }

      router.refresh();
    } catch (err: unknown) {
      setError(isErrorWithMessage(err) ? err.message : 'Failed to save journey');
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Trip Name *</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Summer in Lisbon"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">Destination *</Label>
        <Input
          type="text"
          id="destination"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          placeholder="Lisbon, Portugal"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date *</Label>
          <Input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency *</Label>
        <select
          id="currency"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          required
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} - {currency.name} ({currency.code})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us about your trip..."
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1" size="lg">
          {loading
            ? 'Saving...'
            : isEditMode
              ? 'Save Changes'
              : 'Create Journey'}
        </Button>
        <Button asChild variant="secondary" className="flex-1" size="lg">
          <Link href={isEditMode ? `/journeys/${journeyId}` : '/dashboard'}>
            Cancel
          </Link>
        </Button>
      </div>
    </form>
  );
}
