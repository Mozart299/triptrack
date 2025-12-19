# TripTrack Setup Guide

Complete setup instructions for your Nairobi trip starting Dec 24th!

## Quick Start

### 1. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
   - Choose an organization (or create one)
   - Enter project name: `triptrack`
   - Create a strong database password (save this!)
   - Select a region close to you
   - Click "Create new project"
3. Wait 2-3 minutes for your project to be ready

### 2. Configure Database

1. In your Supabase dashboard, go to the **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open the `supabase-schema.sql` file from the project root
4. Copy all contents and paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - that's good!

### 3. Get API Credentials

1. In Supabase dashboard, go to **Settings** > **API**
2. Find these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)
3. Copy both values

### 4. Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:4200
   ```

3. Do the same in `apps/web/.env.local`

### 5. Start the App

```bash
# Install dependencies if you haven't
npm install

# Start development server
npx nx dev web
```

The app will be available at http://localhost:4200

### 6. Create Your Account

1. Open http://localhost:4200
2. Click "Sign up"
3. Enter your details (use a real email - Supabase will send confirmation)
4. Check your email and click the confirmation link
5. Sign in to the app

### 7. Pre-populate Nairobi Trip Data

1. After signing in, open browser console (F12)
2. Run this command to get your user ID:
   ```javascript
   (await fetch('/api/auth/me').then(r => r.json())).id
   ```
   Or check the Supabase dashboard: Authentication > Users

3. Back in your terminal, run the seed script:
   ```bash
   npm run seed:nairobi <your-user-id>
   ```

Example:
```bash
npm run seed:nairobi 12345678-1234-1234-1234-123456789abc
```

This will create:
- ✅ Nairobi Adventure journey (Dec 24-31)
- ✅ 15 pre-planned activities
- ✅ Sample expenses

### 8. Invite Your Friends

To add your 4 friends:

1. They need to sign up for the app
2. Once they have accounts, you can add them as participants in Supabase:
   - Go to Supabase dashboard > Table Editor
   - Open `journey_participants` table
   - Click "Insert row"
   - Fill in:
     - `journey_id`: Your Nairobi journey ID
     - `user_id`: Your friend's user ID
     - `role`: `participant`
3. Now they'll see the journey and can add expenses!

## Features Overview

### 🗺️ Journey Tracking
- Create trips with start/end dates
- Track journey status (planning, active, completed)
- View all your journeys in one place

### 📍 Activity Check-in
- See upcoming, ongoing, and completed activities
- One-tap check-in when you complete activities
- Timeline view of your entire trip

### 💰 Expense Tracking
- Add expenses with categories
- Automatic equal split among participants
- Track total spending and per-person costs
- Category breakdown (food, transport, etc.)

### 📊 Dashboard
- Quick overview of active journey
- Stats: activities completed, total expenses, days left
- Easy access to all features

## Mobile Experience

TripTrack is built mobile-first! Access it on your phone by:

1. Make sure your dev server is running
2. Find your local IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```
3. On your phone's browser, go to: `http://YOUR-IP:4200`
4. Add to home screen for app-like experience!

## Pre-loaded Nairobi Itinerary

Your seed data includes these activities:

- **Dec 24**: Arrival, hotel check-in, welcome dinner at Carnivore
- **Dec 25**: Nairobi National Park safari, Giraffe Centre
- **Dec 26**: Karen Blixen Museum, Kazuri Beads workshop
- **Dec 27**: Maasai Market shopping, Bomas of Kenya cultural show
- **Dec 28**: David Sheldrick elephant orphanage, rooftop dinner
- **Dec 29**: City walking tour, lunch at Java House
- **Dec 30**: Ngong Hills hike, farewell dinner at Talisman
- **Dec 31**: Hotel checkout, airport transfer

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` files
- Make sure you copied the full anon key (it's very long!)
- Restart the dev server after changing env files

### Email confirmation not arriving
- Check spam folder
- In Supabase dashboard, go to Authentication > Settings
- Disable email confirmation for development (not recommended for production)

### Seed script fails
- Make sure you're using the correct user ID
- Verify the database schema was created successfully
- Check that your `.env.local` has the correct credentials

### Activities/Expenses not showing
- Make sure you've run the seed script
- Check that the journey was created (Dashboard should show it)
- Try refreshing the page

## Next Steps

1. **Customize your itinerary**: Edit activities in Supabase Table Editor
2. **Set your budget**: Add budget goals per category
3. **Add photos**: Enable Supabase Storage for activity photos
4. **Offline support**: Coming soon - cache data for offline access

## Need Help?

- Check the main [README.md](./README.md)
- Review Supabase docs: https://supabase.com/docs
- Open an issue if you find bugs

Enjoy your Nairobi adventure! 🇰🇪✈️
