import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AddExpenseForm from '@/components/features/AddExpenseForm';

export default async function ExpensesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's active or most recent journey
  const { data: journeys } = await supabase
    .from('journeys')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })
    .limit(1);

  const journey = journeys?.[0];

  if (!journey) {
    return (
      <div className="container-app py-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Journey Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create a journey to start tracking expenses
          </p>
          <Link href="/journeys/new" className="btn-primary inline-block">
            Create Journey
          </Link>
        </div>
      </div>
    );
  }

  // Get expenses and participants
  const [{ data: expenses }, { data: participants }] = await Promise.all([
    supabase
      .from('expenses')
      .select('*, profiles!expenses_paid_by_fkey(full_name, email)')
      .eq('journey_id', journey.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('journey_participants')
      .select('*, profiles(id, full_name, email)')
      .eq('journey_id', journey.id),
  ]);

  // Calculate totals
  const totalExpenses =
    expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const byCategory = expenses?.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container-app py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Expenses</h1>
        <p className="text-gray-600">{journey.title}</p>
      </div>

      {/* Total Card */}
      <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-6">
        <p className="text-primary-100 text-sm mb-1">Total Spent</p>
        <p className="text-4xl font-bold mb-4">
          ${totalExpenses.toFixed(2)}
        </p>
        {participants && participants.length > 1 && (
          <p className="text-sm text-primary-100">
            ${(totalExpenses / participants.length).toFixed(2)} per person
          </p>
        )}
      </div>

      {/* Category Breakdown */}
      {byCategory && Object.keys(byCategory).length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">By Category</h2>
          <div className="space-y-3">
            {Object.entries(byCategory).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {category === 'accommodation'
                      ? '🏨'
                      : category === 'transport'
                      ? '🚗'
                      : category === 'food'
                      ? '🍽️'
                      : category === 'activities'
                      ? '🎭'
                      : category === 'shopping'
                      ? '🛍️'
                      : '💵'}
                  </span>
                  <span className="capitalize text-gray-700">{category}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  ${Number(amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Expense Form */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Add Expense</h2>
        <AddExpenseForm
          journeyId={journey.id}
          participants={participants || []}
          userId={user.id}
        />
      </div>

      {/* Expense List */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Recent Expenses
        </h2>
        {expenses && expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {expense.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Paid by{' '}
                      {expense.profiles?.full_name ||
                        expense.profiles?.email ||
                        'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ${Number(expense.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {expense.category}
                    </p>
                  </div>
                </div>
                {expense.notes && (
                  <p className="text-sm text-gray-600 mt-2">{expense.notes}</p>
                )}
                {expense.split_with && expense.split_with.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Split {expense.split_with.length + 1} ways - $
                    {(
                      Number(expense.amount) /
                      (expense.split_with.length + 1)
                    ).toFixed(2)}{' '}
                    per person
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No expenses yet. Add your first expense above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
