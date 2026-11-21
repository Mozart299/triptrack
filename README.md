# TripTrack

TripTrack is a mobile-friendly trip planning and shared-cost web app. It helps travelers create journeys, plan activities, invite participants, check in to trip events, and track who owes what.

How the app, Supabase and the database fit together is described in [`docs/architecture.md`](docs/architecture.md).

## Features

- Email/password authentication with Supabase Auth
- Journey creation, editing, deletion, and participant sharing
- Dashboard view for active and upcoming trips
- Activity planning with scheduled, unscheduled, missed, today, upcoming, and completed states
- Activity search across title, location, description, notes, and category
- Activity filters for category, paid/unpaid, unscheduled, and needs check-in
- Participant invitations through Supabase Edge Functions
- Pending invite visibility on journey detail pages
- Activity cost tracking with paid/unpaid status
- Equal and individual activity cost splits
- Explicit `paid_by` tracking for activity payer balances
- Per-participant cost and balance summaries
- Per-journey currency support
- Responsive navigation and mobile-first UI

## Tech Stack

- **App:** Next.js 16 App Router, React 19, TypeScript
- **UI:** Tailwind CSS, shadcn/Radix primitives, lucide-react icons
- **Backend:** Supabase Auth, PostgreSQL, Row Level Security, Edge Functions
- **Tooling:** Nx workspace, ESLint, Playwright/Jest dependencies

## Repository Layout

```text
triptrack/
├── apps/
│   ├── web/                    # Next.js application
│   │   ├── src/app/            # App Router pages and layouts
│   │   ├── src/components/     # UI, layout, and feature components
│   │   ├── src/lib/            # Supabase clients and shared utilities
│   │   └── src/types/          # App and database types
│   └── web-e2e/                # Playwright e2e project
├── supabase/
│   ├── functions/              # Edge Functions
│   └── migrations/             # Incremental database migrations
├── scripts/                    # Development/seed scripts
├── supabase-schema.sql         # Full database schema for new projects
├── SETUP.md                    # Short setup guide
└── QUICK-START.md              # Minimal local quick start
```

## Prerequisites

- Node.js 20+ recommended
- npm
- Supabase account and project
- Supabase CLI if you want to push migrations from the command line

## Local Setup

Install dependencies:

```bash
npm install
```

Create environment files at both `.env.local` and `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:4200
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is only needed for trusted local scripts such as demo seeding. Do not expose it in client code.

## Database Setup

For a new Supabase project, run the full schema:

1. Open Supabase SQL Editor.
2. Paste the contents of `supabase-schema.sql`.
3. Run the SQL.

For an existing project, apply migrations in `supabase/migrations/`.

Using Supabase CLI:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Manual SQL Editor flow:

1. Open `supabase/migrations/`.
2. Run any migration files not yet applied to your database.
3. Keep `supabase-schema.sql` in sync for fresh installs.

Current migrations:

- `add_currency_to_journeys.sql`
- `add_paid_by_to_activities.sql`

## Running The App

Start the web app:

```bash
npx nx dev web
```

Open `http://localhost:4200`.

Build the web app:

```bash
./node_modules/.bin/next build apps/web
```

Run targeted lint:

```bash
./node_modules/.bin/eslint apps/web/src
```

Optional demo data:

```bash
npm run seed:demo <your-user-id>
```

## Supabase Edge Functions

TripTrack uses `send-journey-invite` to send participant invitations.

Deploy functions:

```bash
supabase functions deploy
```

Required Supabase function secrets:

```env
RESEND_API_KEY=your-resend-api-key
APP_URL=https://your-app-url
```

See `supabase/SETUP.md` and `supabase/functions/send-journey-invite/README.md` for details.

## Core Routes

- `/login`, `/signup`, `/forgot-password`, `/reset-password`
- `/dashboard`
- `/journeys`
- `/journeys/new`
- `/journeys/[id]`
- `/journeys/[id]/edit`
- `/journeys/[id]/activities/new`
- `/journeys/[id]/activities/[activityId]/edit`
- `/activities`
- `/expenses`
- `/profile`
- `/invite/accept`

## Data Model

Main tables:

- `profiles`: user profile data synced from Supabase Auth
- `journeys`: trip metadata, destination, dates, owner, currency
- `journey_participants`: shared journey membership and roles
- `activities`: trip activities, scheduling, check-in state, cost, payer, split settings
- `activity_participant_costs`: individual participant costs for custom splits
- `expenses`: broader expense table
- `pending_invites`: invitation tokens for users who have not joined yet

Row Level Security is enabled on user-facing tables. Users can access journeys and activities they own or participate in.

## Notes And Limitations

- Activity balances use the explicit `activities.paid_by` field. Older rows are backfilled to the activity creator by migration.
- Offline support is not implemented.
- Push notifications are not implemented.
- Receipt/photo uploads are not configured.
- The Expenses page exists, but the most developed cost flow is currently activity-based splitting.
- The Next build may need network access to fetch the configured Google font through `next/font`.

## License

MIT
