import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ExpensesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Expenses are currently hidden in planning-first mode — redirect to journeys
  redirect('/journeys');
}
