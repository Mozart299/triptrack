import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function InvalidInvitePage({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="justify-items-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="size-6" />
          </div>
          <CardTitle>Invalid Invitation</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function InviteAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <InvalidInvitePage message="No invitation token was provided." />;
  }

  const admin = (await import('@/lib/supabase/admin')).createAdminClient();
  const { data: invites } = await admin
    .from('pending_invites')
    .select('*')
    .eq('token', token)
    .limit(1);

  const invite = invites?.[0];
  if (!invite) {
    return (
      <InvalidInvitePage message="This invitation has expired or already been used." />
    );
  }

  const cookieStore = await cookies();
  const supabaseServer = (await import('@supabase/supabase-js')).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, detectSessionInUrl: false },
      global: {
        headers: {
          cookie: cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join('; '),
        },
      },
    },
  );

  const { data: userData } = await supabaseServer.auth.getUser();
  const currentUser = userData?.user;

  if (!currentUser) {
    redirect(`/login?redirect=/invite/accept?token=${token}`);
  }

  await admin.from('journey_participants').insert({
    journey_id: invite.journey_id,
    user_id: currentUser.id,
    role: 'participant',
  });

  await admin.from('pending_invites').delete().eq('id', invite.id);

  redirect(`/journeys/${invite.journey_id}`);
}
