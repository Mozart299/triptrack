import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/features/ProfileForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  return (
    <div className="container-app py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Update your name and manage your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialName={profile?.full_name || user.user_metadata?.full_name || ''}
              email={user.email || ''}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
