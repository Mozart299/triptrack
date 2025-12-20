'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface InviteProps {
  journeyId: string;
}

export default function InviteParticipant({ journeyId }: InviteProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  console.log('InviteParticipant rendered, open:', open);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // Get current user info for the invitation
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      // Call the Edge Function to send invitation
      const { data, error } = await supabase.functions.invoke('send-journey-invite', {
        body: {
          journeyId,
          inviteeEmail: email.toLowerCase().trim(),
          inviterName: profile?.full_name || 'A friend',
        },
      });

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
          text: '✓ Invitation sent! They have been added to the trip and will receive an email.',
          type: 'success'
        });
      } else {
        setMessage({
          text: '✓ Invitation sent! They will receive an email with signup instructions.',
          type: 'success'
        });
      }

      setEmail('');

      // Close modal after 2 seconds and refresh page
      setTimeout(() => {
        setOpen(false);
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      console.error('Invitation error:', err);
      setMessage({
        text: err?.message || 'Failed to send invitation. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          console.log('Invite button clicked!');
          setOpen(true);
        }}
        className="w-full mt-4 btn-secondary text-sm"
      >
        + Invite Participant
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999 }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            style={{ backgroundColor: 'white', maxWidth: '28rem', padding: '1.5rem', borderRadius: '0.5rem' }}
          >
            <h3 className="text-lg font-semibold mb-2">Invite Participant</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter their email address. They'll receive an invitation to join this trip.
              {' '}If they don't have an account, they'll be invited to sign up.
            </p>
            <form onSubmit={handleInvite} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                className="input-field w-full"
              />
              {message && (
                <div className={`text-sm p-3 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Sending Invitation…' : 'Send Invitation'}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
