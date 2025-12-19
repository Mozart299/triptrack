-- TripTrack Database Schema for Supabase
-- This schema supports journey tracking, activity management, and expense splitting

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT
);

-- Journeys table (trips/travels)
CREATE TABLE IF NOT EXISTS journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('planning', 'active', 'completed')) DEFAULT 'planning',
  cover_image_url TEXT
);

-- Journey participants (for shared trips)
CREATE TABLE IF NOT EXISTS journey_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'participant')) DEFAULT 'participant',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(journey_id, user_id)
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  category TEXT CHECK (category IN ('transport', 'accommodation', 'dining', 'sightseeing', 'entertainment', 'other')) DEFAULT 'other',
  notes TEXT
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT CHECK (category IN ('transport', 'accommodation', 'food', 'activities', 'shopping', 'other')) DEFAULT 'other',
  paid_by UUID NOT NULL REFERENCES profiles(id),
  split_with UUID[] DEFAULT '{}',
  notes TEXT,
  receipt_url TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_journeys_user_id ON journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_journeys_status ON journeys(status);
CREATE INDEX IF NOT EXISTS idx_journeys_start_date ON journeys(start_date);
CREATE INDEX IF NOT EXISTS idx_journey_participants_journey_id ON journey_participants(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_participants_user_id ON journey_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_journey_id ON activities(journey_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled_at ON activities(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_expenses_journey_id ON expenses(journey_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Journeys policies
CREATE POLICY "Users can view their own journeys"
  ON journeys FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT user_id FROM journey_participants WHERE journey_id = journeys.id
    )
  );

CREATE POLICY "Users can create their own journeys"
  ON journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journeys"
  ON journeys FOR UPDATE
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT user_id FROM journey_participants WHERE journey_id = journeys.id AND role = 'owner'
    )
  );

CREATE POLICY "Users can delete their own journeys"
  ON journeys FOR DELETE
  USING (auth.uid() = user_id);

-- Journey participants policies
CREATE POLICY "Users can view participants of their journeys"
  ON journey_participants FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM journey_participants WHERE journey_id = journey_participants.journey_id
    )
  );

CREATE POLICY "Journey owners can add participants"
  ON journey_participants FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM journeys WHERE id = journey_id
    )
  );

CREATE POLICY "Journey owners can remove participants"
  ON journey_participants FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM journeys WHERE id = journey_id
    )
  );

-- Activities policies
CREATE POLICY "Users can view activities in their journeys"
  ON activities FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM journey_participants WHERE journey_id = activities.journey_id
    )
    OR auth.uid() IN (
      SELECT user_id FROM journeys WHERE id = activities.journey_id
    )
  );

CREATE POLICY "Users can create activities in their journeys"
  ON activities FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM journey_participants WHERE journey_id = journey_id
    )
    OR auth.uid() IN (
      SELECT user_id FROM journeys WHERE id = journey_id
    )
  );

CREATE POLICY "Users can update activities they created"
  ON activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete activities they created"
  ON activities FOR DELETE
  USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view expenses in their journeys"
  ON expenses FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM journey_participants WHERE journey_id = expenses.journey_id
    )
    OR auth.uid() IN (
      SELECT user_id FROM journeys WHERE id = expenses.journey_id
    )
  );

CREATE POLICY "Users can create expenses in their journeys"
  ON expenses FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM journey_participants WHERE journey_id = journey_id
    )
    OR auth.uid() IN (
      SELECT user_id FROM journeys WHERE id = journey_id
    )
  );

CREATE POLICY "Users can update expenses they created"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete expenses they created"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journeys_updated_at
  BEFORE UPDATE ON journeys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
