'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import ParticipantCostInput from '@/components/features/ParticipantCostInput';
import ParticipantSelector from '@/components/features/ParticipantSelector';
import { Profile, CostSplitType } from '@/types';

export type ActivityCategory =
  | 'transport'
  | 'accommodation'
  | 'dining'
  | 'sightseeing'
  | 'entertainment'
  | 'other';

export interface ActivityFormData {
  title: string;
  description: string;
  location: string;
  scheduledAt: string;
  category: ActivityCategory;
  estimatedCost: string;
  notes: string;
  costSplitType: CostSplitType;
}

export interface ParticipantCost {
  userId: string;
  amount: number;
  notes?: string;
}

export const defaultActivityFormData: ActivityFormData = {
  title: '',
  description: '',
  location: '',
  scheduledAt: '',
  category: 'other',
  estimatedCost: '',
  notes: '',
  costSplitType: 'none',
};

interface ActivityFormProps {
  initialData?: Partial<ActivityFormData>;
  initialSelectedParticipants?: string[];
  initialParticipantCosts?: ParticipantCost[];
  participants: Profile[];
  currency: string;
  loading: boolean;
  error: string | null;
  cancelHref: string;
  submitLabel: string;
  extraActions?: React.ReactNode;
  onSubmit: (
    data: ActivityFormData,
    participantCosts: ParticipantCost[],
    selectedParticipants: string[],
  ) => void;
}

export default function ActivityForm({
  initialData,
  initialSelectedParticipants = [],
  initialParticipantCosts = [],
  participants,
  currency,
  loading,
  error,
  cancelHref,
  submitLabel,
  extraActions,
  onSubmit,
}: ActivityFormProps) {
  const [formData, setFormData] = useState<ActivityFormData>({
    ...defaultActivityFormData,
    ...initialData,
  });
  const [participantCosts, setParticipantCosts] = useState<ParticipantCost[]>(
    initialParticipantCosts,
  );
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    initialSelectedParticipants,
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, participantCosts, selectedParticipants);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Activity Name *</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Museum visit"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City center"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="scheduledAt">Scheduled Date &amp; Time</Label>
          <Input
            type="datetime-local"
            id="scheduledAt"
            name="scheduledAt"
            value={formData.scheduledAt}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                category: value as ActivityCategory,
              }))
            }
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="accommodation">Accommodation</SelectItem>
              <SelectItem value="dining">Dining</SelectItem>
              <SelectItem value="sightseeing">Sightseeing</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimatedCost">Estimated Cost</Label>
        <Input
          type="number"
          id="estimatedCost"
          name="estimatedCost"
          value={formData.estimatedCost}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
        />
      </div>

      {participants.length > 1 && (
        <>
          <div className="space-y-3">
            <Label>Cost Split Type</Label>
            <RadioGroup
              value={formData.costSplitType}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  costSplitType: value as CostSplitType,
                }))
              }
              className="space-y-2"
            >
              <Label
                htmlFor="split-none"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <RadioGroupItem value="none" id="split-none" />
                <div>
                  <div className="font-medium">No Split</div>
                  <div className="text-sm text-muted-foreground">
                    Single person or untracked cost
                  </div>
                </div>
              </Label>
              <Label
                htmlFor="split-equal"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <RadioGroupItem value="equal" id="split-equal" />
                <div>
                  <div className="font-medium">Split Equally</div>
                  <div className="text-sm text-muted-foreground">
                    Divide cost evenly among all participants
                  </div>
                </div>
              </Label>
              <Label
                htmlFor="split-individual"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <RadioGroupItem value="individual" id="split-individual" />
                <div>
                  <div className="font-medium">Individual Costs</div>
                  <div className="text-sm text-muted-foreground">
                    Set different costs for each participant
                  </div>
                </div>
              </Label>
            </RadioGroup>
          </div>

          {formData.costSplitType === 'equal' && (
            <ParticipantSelector
              participants={participants}
              selectedParticipants={selectedParticipants}
              onChange={setSelectedParticipants}
              estimatedCost={
                formData.estimatedCost
                  ? parseFloat(formData.estimatedCost)
                  : undefined
              }
              currency={currency}
            />
          )}

          {formData.costSplitType === 'individual' && (
            <ParticipantCostInput
              participants={participants}
              costs={participantCosts}
              onChange={setParticipantCosts}
              currency={currency}
            />
          )}
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="What are you planning to do?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={2}
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="min-h-[44px] flex-1"
          size="lg"
        >
          {loading ? 'Saving...' : submitLabel}
        </Button>
        <Button
          asChild
          variant="secondary"
          className="min-h-[44px] flex-1"
          size="lg"
        >
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>

      {extraActions}
    </form>
  );
}
