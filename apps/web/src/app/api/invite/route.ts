import { NextResponse } from 'next/server';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { journeyId, email } = body || {};
    if (!journeyId || !email) {
      return NextResponse.json({ error: 'journeyId and email required' }, { status: 400 });
    }

    // Get current user from cookies (server)
    const cookieStore = cookies();
    const supabaseServer = (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, detectSessionInUrl: false },
        global: { headers: { cookie: cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ') } }
      }
    );

    const { data: userData } = await supabaseServer.auth.getUser();
    const currentUser = userData?.user;
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Check if profile exists for email
    const { data: profiles, error: profErr } = await admin
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .limit(1);

    if (profErr) throw profErr;

    const profile = profiles?.[0];
    if (profile) {
      // Add as participant if not already
      const { error: insertErr } = await admin.from('journey_participants').insert({
        journey_id: journeyId,
        user_id: profile.id,
        role: 'participant',
      });
      if (insertErr) {
        // If already exists, return ok
        return NextResponse.json({ ok: true, message: insertErr.message }, { status: 200 });
      }
      return NextResponse.json({ ok: true, added: true });
    }

    // Create pending invite
    const token = crypto.randomBytes(20).toString('hex');
    const { error: inviteErr } = await admin.from('pending_invites').insert({
      journey_id: journeyId,
      email,
      token,
      invited_by: currentUser.id,
    });
    if (inviteErr) throw inviteErr;

    // Send email via SendGrid
    try {
      const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${token}`;
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@triptrack.app',
        subject: `You're invited to join a TripTrack journey`,
        html: `<p>You were invited to join a TripTrack journey. Click to accept:</p><p><a href="${acceptUrl}">${acceptUrl}</a></p>`,
      });
    } catch (sendErr) {
      // email failure shouldn't block invite creation
      console.error('SendGrid error', sendErr);
    }

    return NextResponse.json({ ok: true, invited: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
