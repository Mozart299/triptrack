'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isErrorWithMessage } from '@/lib/errors';

interface InviteProps {
  journeyId: string;
}

export default function InviteParticipant({ journeyId }: InviteProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // Get current user info for the invitation
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      // Call the Edge Function to send invitation
      const { data, error } = await supabase.functions.invoke(
        'send-journey-invite',
        {
          body: {
            journeyId,
            inviteeEmail: email.toLowerCase().trim(),
            inviterName: profile?.full_name || 'A friend',
          },
        },
      );

      if (error) {
        throw error;
      }

      if (data.error) {
        setMessage({ text: data.error, type: 'error' });
        setLoading(false);
        return;
      }

      // Success!
      if (data.userExists) {
        setMessage({
          text: 'Invitation sent! They have been added to the trip and will receive an email.',
          type: 'success',
        });
      } else {
        setMessage({
          text: 'Invitation sent! They will receive an email with signup instructions.',
          type: 'success',
        });
      }

      setEmail('');

      // Close modal after 2 seconds and refresh page
      setTimeout(() => {
        setOpen(false);
        window.location.reload();
      }, 2000);
    } catch (err: unknown) {
      console.error('Invitation error:', err);
      setMessage({
        text: isErrorWithMessage(err)
          ? err.message
          : 'Failed to send invitation. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        variant="secondary"
        className="mt-4 w-full"
      >
        Invite Participant
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Participant</DialogTitle>
            <DialogDescription>
              Enter their email address. They'll receive an invitation to join
              this trip.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
              />
            </div>
            {message && (
              <Alert
                variant={message.type === 'error' ? 'destructive' : 'default'}
                className={
                  message.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : undefined
                }
              >
                {message.type === 'success' && (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Sending Invitation...' : 'Send Invitation'}
              </Button>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
