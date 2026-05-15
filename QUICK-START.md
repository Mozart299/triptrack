# Quick Start

Follow these steps to get TripTrack running with your own trip data.

## Checklist

### Step 1: Create Supabase Project

1. Go to https://supabase.com.
2. Create a new project named `triptrack`.
3. Save the database password and wait for the project to initialize.

### Step 2: Set Up Database

1. Open the Supabase SQL Editor.
2. Copy the contents of `supabase-schema.sql`.
3. Paste and run it in the SQL Editor.

### Step 3: Configure Environment

Update `.env.local` and `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:4200
```

### Step 4: Start the App

```bash
npm install
npx nx dev web
```

Open http://localhost:4200.

### Step 5: Create an Account

Sign up, confirm your email if Supabase email confirmation is enabled, then sign in.

### Optional: Load Sample Data

The repo includes an optional sample seed script:

```bash
npm run seed:nairobi YOUR-USER-ID-HERE
```

Use this only if you want demo data. Otherwise, create your own journey from the app.

## Explore

- Dashboard: active trip overview
- Journeys: create and manage trips
- Activities: plan and check off trip activities
- Expenses: track shared trip costs

## Troubleshooting

- If the app will not start, run `npm install` and restart `npx nx dev web`.
- If auth fails, verify both `.env.local` files and restart the dev server.
- If no trips appear, create a new journey or run the optional seed script.
