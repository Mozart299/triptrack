# Send Journey Invite Edge Function

This Supabase Edge Function handles sending email invitations when users invite others to join their trips.

## Features

- **For Existing Users**: Adds them as a participant and sends a journey invitation email
- **For New Users**: Sends a signup invitation with a link to create an account and join the trip
- Uses **Resend** for reliable email delivery
- Beautiful HTML email templates with trip details

## Setup

### 1. Get a Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain for development)
3. Create an API key

### 2. Set Environment Variables

Add these to your Supabase project:

```bash
# In Supabase Dashboard → Project Settings → Edge Functions → Environment Variables
RESEND_API_KEY=re_xxx...
APP_URL=https://yourdomain.com  # or http://localhost:4200 for local
```

### 3. Deploy the Function

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-journey-invite
```

### 4. Local Development

```bash
# Start Supabase functions locally
supabase functions serve send-journey-invite --env-file .env.local

# Test the function
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-journey-invite' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"journeyId":"xxx","inviteeEmail":"friend@example.com","inviterName":"John Doe"}'
```

## Email Templates

The function includes two email templates:

1. **Existing User**: Notifies them they've been added to a trip
2. **New User**: Invites them to sign up and join the trip

Both templates are:
- Mobile-responsive
- Branded with TripTrack colors
- Include trip details (title, destination, dates)
- Have clear call-to-action buttons

## API Reference

### Request Body

```typescript
{
  journeyId: string;      // UUID of the journey
  inviteeEmail: string;   // Email address to invite
  inviterName?: string;   // Name of person sending invite (optional)
}
```

### Response

```typescript
{
  success: true;
  userExists: boolean;        // Whether user has an account
  participantAdded: boolean;  // Whether they were added to journey
  emailId: string;           // Resend email ID
}
```

### Error Response

```typescript
{
  error: string;  // Error message
}
```

## Security

- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for adding participants
- Validates journey exists before sending invite
- Checks for duplicate participants
- Email addresses are normalized (lowercased and trimmed)

## Customization

### Change Email Sender

Edit the `from` field in the Resend API call:

```typescript
from: 'Your App <invites@yourdomain.com>'
```

### Customize Email Templates

Edit the `emailHtml` and `emailText` variables in the function to match your branding.

### Change App URL

Set the `APP_URL` environment variable to your production domain.
