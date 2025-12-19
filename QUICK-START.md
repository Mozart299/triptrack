# 🚀 Quick Start - Get Running in 10 Minutes

Follow these steps to have TripTrack running with your Nairobi trip data!

## Checklist

### ☐ Step 1: Create Supabase Project (3 mins)

1. Go to https://supabase.com
2. Sign up or login
3. Click "New Project"
4. Fill in:
   - Name: `triptrack`
   - Database password: (create a strong one - save it!)
   - Region: (pick closest to you)
5. Click "Create new project"
6. ⏳ Wait 2-3 minutes for it to initialize

### ☐ Step 2: Set Up Database (2 mins)

1. In Supabase dashboard → **SQL Editor**
2. Click "+ New Query"
3. Open `supabase-schema.sql` from this project
4. Copy ALL contents
5. Paste into SQL Editor
6. Click **Run** or press `Cmd/Ctrl + Enter`
7. ✅ Should see "Success. No rows returned"

### ☐ Step 3: Get API Credentials (1 min)

1. In Supabase → **Settings** → **API**
2. Copy these two values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJxxx...
   ```
3. Keep them handy for next step

### ☐ Step 4: Configure App (1 min)

1. Open `.env.local` in project root
2. Replace with your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...your-key
   NEXT_PUBLIC_APP_URL=http://localhost:4200
   ```
3. Open `apps/web/.env.local`
4. Add the same values there

### ☐ Step 5: Start the App (1 min)

```bash
# Make sure you're in the triptrack directory
cd triptrack

# Start development server
npx nx dev web
```

Wait for it to compile, then open: **http://localhost:4200**

### ☐ Step 6: Create Account (1 min)

1. Click "Sign up"
2. Enter:
   - Full name: Your name
   - Email: Your real email
   - Password: At least 6 characters
3. Click "Create Account"
4. Check your email
5. Click confirmation link
6. Return to app and sign in

### ☐ Step 7: Get Your User ID (30 secs)

**Option A: Browser Console**
1. While logged in, press F12 (open DevTools)
2. Go to Console tab
3. Paste and run:
   ```javascript
   supabase.auth.getUser().then(d => console.log('User ID:', d.data.user.id))
   ```
4. Copy the UUID that appears

**Option B: Supabase Dashboard**
1. Go to Supabase → **Authentication** → **Users**
2. Find your email
3. Copy the ID (UUID format)

### ☐ Step 8: Load Nairobi Data (1 min)

```bash
# In your terminal, run:
npm run seed:nairobi YOUR-USER-ID-HERE
```

Example:
```bash
npm run seed:nairobi 12345678-abcd-1234-abcd-123456789abc
```

You should see:
```
🌍 Starting Nairobi trip seed...
✅ Journey created: Nairobi Adventure 2024
✅ Created 15 activities
✅ Created 3 sample expenses
🎉 Nairobi trip seed complete!
```

### ☐ Step 9: Explore the App! 🎊

1. Refresh the page
2. You should see your Nairobi trip on the dashboard!
3. Click around:
   - **Dashboard** → See trip overview
   - **Activities** → View your 15 pre-loaded activities
   - **Expenses** → See sample expenses, add new ones
   - **Journeys** → See all trips

## ✅ You're Done!

Your TripTrack MVP is fully set up with:
- ✅ Nairobi Adventure trip (Dec 24-31, 2024)
- ✅ 15 activities (safari, giraffe centre, hike, etc.)
- ✅ Sample expenses
- ✅ Full tracking capabilities

## 📱 Access on Mobile

1. Find your computer's local IP:
   ```bash
   # macOS/Linux:
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Windows:
   ipconfig
   ```

2. On your phone, go to: `http://YOUR-IP:4200`

3. Add to home screen for app-like experience!

## 🤝 Add Your Friends

To add your 4 friends:

1. They sign up on the app
2. Get their user IDs (same way you got yours)
3. In Supabase dashboard:
   - Go to **Table Editor** → `journey_participants`
   - Click "Insert row"
   - journey_id: (get from `journeys` table - your Nairobi trip ID)
   - user_id: (your friend's UUID)
   - role: `participant`
4. They'll now see the trip and can add expenses!

Or wait for friend invitation feature (quick to add if needed).

## 🆘 Troubleshooting

**App won't start?**
- Run `npm install` first
- Check you're in the `triptrack` directory

**"Invalid API key" error?**
- Double-check `.env.local` values
- Make sure no extra spaces
- Restart dev server: Ctrl+C, then `npx nx dev web`

**Seed script error?**
- Make sure database schema was created
- Check user ID is correct (UUID format)
- Verify `.env.local` has correct credentials

**Nothing showing on dashboard?**
- Seed script must complete successfully
- Refresh the page
- Check browser console for errors (F12)

**Email not arriving?**
- Check spam folder
- In Supabase: Auth → Settings → Disable email confirmation (dev only)

## 📚 Next Steps

- Read [MVP-SUMMARY.md](./MVP-SUMMARY.md) for full feature list
- Check [SETUP.md](./SETUP.md) for detailed setup info
- See [README.md](./README.md) for technical details

Enjoy tracking your Nairobi adventure! 🇰🇪✈️
