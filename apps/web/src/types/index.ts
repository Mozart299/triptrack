import { Database } from './database.types';

// Helper types from database
export type Journey = Database['public']['Tables']['journeys']['Row'];
export type JourneyInsert = Database['public']['Tables']['journeys']['Insert'];
export type JourneyUpdate = Database['public']['Tables']['journeys']['Update'];

export type Activity = Database['public']['Tables']['activities']['Row'];
export type ActivityInsert = Database['public']['Tables']['activities']['Insert'];
export type ActivityUpdate = Database['public']['Tables']['activities']['Update'];

export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

export type JourneyParticipant = Database['public']['Tables']['journey_participants']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Application-specific types
export interface JourneyWithParticipants extends Journey {
  participants: Profile[];
  participant_count: number;
}

export interface ActivityWithExpenses extends Omit<Activity, 'estimated_cost'> {
  expenses: Expense[];
  total_cost: number;
  estimated_cost: number | null;
}

export interface JourneyStats {
  total_expenses: number;
  total_activities: number;
  completed_activities: number;
  currency: string;
  total_estimated_budget?: number;
}

export interface ExpenseSummary {
  total: number;
  by_category: Record<string, number>;
  by_person: Record<string, number>;
  splits: {
    user_id: string;
    name: string;
    paid: number;
    owed: number;
    balance: number;
  }[];
}

export type JourneyStatus = 'planning' | 'active' | 'completed';
export type ActivityCategory = 'transport' | 'accommodation' | 'dining' | 'sightseeing' | 'entertainment' | 'other';
export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'activities' | 'shopping' | 'other';
