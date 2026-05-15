# TripTrack MVP Summary

TripTrack is now structured as a general-purpose trip tracker for any adventure.

## Completed Features

### Authentication

- Email/password signup and login
- Supabase session management
- Protected dashboard routes

### Journey Management

- Create, edit, view, and delete trips
- Track destination, dates, status, participants, and currency
- Dashboard overview for current trips

### Activity Planning

- Add and edit activities
- Track scheduled, unscheduled, ongoing, and completed activities
- Check in to activities
- Categorize activities

### Cost Tracking

- Add estimated activity costs
- Mark costs as paid
- Split costs equally or with individual participant amounts
- View participant cost summaries

### UI

- Shadcn component setup via the official CLI
- Responsive dashboard/navigation shell
- Mobile-friendly cards, forms, buttons, badges, alerts, dialogs, and inputs

## Optional Sample Data

The repo keeps `scripts/seed-nairobi.ts` as demo data for development. It is not part of the product scope and can be replaced with other seed scripts later.

## Useful Commands

```bash
npx nx dev web
npx next build apps/web
npm run seed:nairobi <your-user-id>
```

## Current Limitations

- Offline support is not implemented.
- Push notifications are not implemented.
- Photo uploads are not configured.
- The sample seed script is still destination-specific.
