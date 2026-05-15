# TripTrack

A trip tracking and expense management web app built for any adventure.

## Features

- **Journey Tracking**: Create and manage trips with dates, destinations, and participants
- **Activity Management**: Plan and track activities throughout your journey
- **Expense Splitting**: Record expenses and automatically split costs among participants
- **Mobile-First Design**: Optimized for mobile devices with responsive Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS (mobile-first)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Monorepo**: Nx

## Project Structure

```
triptrack/
├── apps/
│   └── web/                    # Next.js app
│       └── src/
│           ├── app/            # App Router pages
│           ├── components/     # Reusable components
│           │   ├── ui/         # UI primitives
│           │   └── layout/     # Layout components
│           ├── features/       # Feature modules
│           │   ├── journeys/   # Journey management
│           │   ├── activities/ # Activity management
│           │   ├── expenses/   # Expense tracking
│           │   └── auth/       # Authentication
│           ├── lib/
│           │   └── supabase/   # Supabase clients
│           ├── types/          # TypeScript types
│           ├── utils/          # Utility functions
│           └── hooks/          # Custom React hooks
├── supabase-schema.sql         # Database schema
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works great)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once your project is ready, go to **Settings > API**
3. Copy your **Project URL** and **anon/public key**

### 3. Set Up the Database

1. In your Supabase project, go to the **SQL Editor**
2. Copy the contents of `supabase-schema.sql`
3. Paste and run it in the SQL Editor
4. This will create all tables, indexes, and Row Level Security policies

### 4. Configure Environment Variables

1. Update `.env.local` with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_URL=http://localhost:4200
   ```

2. Also update `apps/web/.env.local` with the same values

### 5. Run the Development Server

```bash
npx nx dev web
```

The app will be available at `http://localhost:4200`

## Database Schema

### Tables

- **profiles**: User profiles (extends Supabase auth.users)
- **journeys**: Trip/travel information
- **journey_participants**: Links users to shared journeys
- **activities**: Activities and events during journeys
- **expenses**: Expense tracking with split functionality

### Key Features

- Row Level Security (RLS) enabled on all tables
- Automatic profile creation on user signup
- Automatic timestamp updates
- Optimized indexes for common queries

## Nx Commands

### Development

```bash
# Run dev server
npx nx dev web

# Run tests
npx nx test web

# Lint code
npx nx lint web

# Build for production
npx nx build web

# View project graph
npx nx graph
```

## MVP Scope

1. **Authentication**
   - Sign up / Sign in with email
   - Profile management

2. **Journey Management**
   - Create journeys for any destination
   - View journey details
   - Update journey status

3. **Activity Tracking**
   - Add activities
   - Mark activities as complete
   - View activity timeline

4. **Expense Management**
   - Add expenses
   - Categorize expenses
   - Split expenses among participants
   - View expense summary

## Next Steps

1. Build authentication pages (`/login`, `/signup`)
2. Create journey dashboard
3. Implement activity management UI
4. Build expense tracking and splitting features
5. Add mobile PWA support

## License

MIT
