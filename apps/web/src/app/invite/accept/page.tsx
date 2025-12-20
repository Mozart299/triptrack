import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function InviteAcceptPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams?.token;
  if (!token) return <div>Invalid invite</div> as any;

  // server-side: find pending invite
  const admin = (await import('@/lib/supabase/admin')).createAdminClient();
  const { data: invites } = await admin.from('pending_invites').select('*').eq('token', token).limit(1);
  const invite = invites?.[0];
  if (!invite) return <div>Invite not found or expired</div> as any;

  // If user is logged in, add participant
  const cookieStore = await cookies();
  const supabaseServer = (await import('@supabase/supabase-js')).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, detectSessionInUrl: false }, global: { headers: { cookie: cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ') } } }
  );
  const { data: userData } = await supabaseServer.auth.getUser();
  const currentUser = userData?.user;
  if (!currentUser) {
    // redirect to login preserving token
    redirect(`/auth/login?redirect=/invite/accept?token=${token}`);
  }

  // add participant record
  await admin.from('journey_participants').insert({ journey_id: invite.journey_id, user_id: currentUser.id, role: 'participant' });
  // delete pending invite
  await admin.from('pending_invites').delete().eq('id', invite.id);

  redirect(`/journeys/${invite.journey_id}`);
}
