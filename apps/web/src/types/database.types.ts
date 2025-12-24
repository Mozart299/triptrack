export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      journeys: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string
          description: string | null
          destination: string
          start_date: string
          end_date: string
          status: 'planning' | 'active' | 'completed'
          cover_image_url: string | null
          currency: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title: string
          description?: string | null
          destination: string
          start_date: string
          end_date: string
          status?: 'planning' | 'active' | 'completed'
          cover_image_url?: string | null
          currency?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string
          description?: string | null
          destination?: string
          start_date?: string
          end_date?: string
          status?: 'planning' | 'active' | 'completed'
          cover_image_url?: string | null
          currency?: string
        }
      }
      activities: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          journey_id: string
          user_id: string
          title: string
          description: string | null
          location: string | null
          scheduled_at: string | null
          completed_at: string | null
          category: 'transport' | 'accommodation' | 'dining' | 'sightseeing' | 'entertainment' | 'other'
          notes: string | null
          estimated_cost: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          journey_id: string
          user_id: string
          title: string
          description?: string | null
          location?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          category?: 'transport' | 'accommodation' | 'dining' | 'sightseeing' | 'entertainment' | 'other'
          notes?: string | null
          estimated_cost?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          journey_id?: string
          user_id?: string
          title?: string
          description?: string | null
          location?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          category?: 'transport' | 'accommodation' | 'dining' | 'sightseeing' | 'entertainment' | 'other'
          notes?: string | null
          estimated_cost?: number | null
        }
      }
      expenses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          journey_id: string
          user_id: string
          activity_id: string | null
          title: string
          amount: number
          currency: string
          category: 'transport' | 'accommodation' | 'food' | 'activities' | 'shopping' | 'other'
          paid_by: string
          split_with: string[]
          notes: string | null
          receipt_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          journey_id: string
          user_id: string
          activity_id?: string | null
          title: string
          amount: number
          currency?: string
          category?: 'transport' | 'accommodation' | 'food' | 'activities' | 'shopping' | 'other'
          paid_by: string
          split_with?: string[]
          notes?: string | null
          receipt_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          journey_id?: string
          user_id?: string
          activity_id?: string | null
          title?: string
          amount?: number
          currency?: string
          category?: 'transport' | 'accommodation' | 'food' | 'activities' | 'shopping' | 'other'
          paid_by?: string
          split_with?: string[]
          notes?: string | null
          receipt_url?: string | null
        }
      }
      journey_participants: {
        Row: {
          id: string
          created_at: string
          journey_id: string
          user_id: string
          role: 'owner' | 'participant'
          joined_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          journey_id: string
          user_id: string
          role?: 'owner' | 'participant'
          joined_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          journey_id?: string
          user_id?: string
          role?: 'owner' | 'participant'
          joined_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
