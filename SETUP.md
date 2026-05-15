# TripTrack Setup Guide

TripTrack is a general-purpose trip planning, activity tracking, and shared cost app.

## 1. Set Up Supabase

1. Create a project at https://supabase.com.
2. Save the Project URL and anon/public key from Settings > API.
3. Run `supabase-schema.sql` in the Supabase SQL Editor.

## 2. Configure Environment Variables

Set the same values in `.env.local` and `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:4200
```

## 3. Run Locally

```bash
npm install
npx nx dev web
```

The app will be available at http://localhost:4200.

## 4. Create Your First Trip

1. Sign up or sign in.
2. Create a journey for any destination.
3. Add activities, invite participants, and track costs.

## Optional Sample Data

The repository includes an optional sample/demo seed script:

```bash
npm run seed:demo <your-user-id>
```

This is optional and not required for normal TripTrack usage.

## Features

- Create and manage journeys for any destination
- Add scheduled or unscheduled activities
- Track completed activities
- Invite participants
- Split activity costs equally or individually
- View per-participant cost summaries

## Mobile Use

Run the dev server, find your computer's local IP, then open `http://YOUR-IP:4200` on your phone.

## Troubleshooting

- Invalid API key: check both `.env.local` files and restart the dev server.
- Email confirmation not arriving: check spam or adjust Supabase auth settings for development.
- Empty dashboard: create a journey or run the optional sample seed.
