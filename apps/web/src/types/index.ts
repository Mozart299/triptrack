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

export type ActivityParticipantCost = Database['public']['Tables']['activity_participant_costs']['Row'];
export type ActivityParticipantCostInsert = Database['public']['Tables']['activity_participant_costs']['Insert'];
export type ActivityParticipantCostUpdate = Database['public']['Tables']['activity_participant_costs']['Update'];

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

export interface ActivityWithCosts extends Activity {
  participant_costs?: ActivityParticipantCost[];
}

export interface ParticipantWithCost extends Profile {
  cost_amount?: number;
  cost_notes?: string;
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
export type CostSplitType = 'equal' | 'individual' | 'none';

export interface JourneyParticipantProfile {
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface ActivityParticipantCostWithProfile {
  user_id: string;
  amount: number;
  notes: string | null;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}
