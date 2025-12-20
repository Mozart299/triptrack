# Supabase Edge Functions Setup

This guide will help you set up and deploy the TripTrack Supabase Edge Functions.

## Prerequisites

1. A Supabase project
2. Supabase CLI installed: `npm install -g supabase`
3. A Resend account (for email sending)

## Quick Start

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
cd triptrack
supabase link --project-ref <your-project-ref>
```

You can find your project ref in your Supabase project URL:
`https://app.supabase.com/project/<project-ref>/`

### 4. Set Up Resend

1. Sign up at [resend.com](https://resend.com)
2. Verify a domain (or use their test domain for development)
3. Create an API key
4. Copy the API key

### 5. Configure Environment Variables

Go to your Supabase Dashboard:
`Project Settings → Edge Functions → Add new secret`

Add these secrets:

| Name | Value | Description |
|------|-------|-------------|
| `RESEND_API_KEY` | `re_xxx...` | Your Resend API key |
| `APP_URL` | `https://yourdomain.com` | Your app's URL (or `http://localhost:4200` for local) |

**Note**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in Edge Functions.

### 6. Deploy the Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy a specific function
supabase functions deploy send-journey-invite
```

### 7. Test the Function

You can test the deployed function using curl:

```bash
curl -i --location --request POST 'https://<project-ref>.supabase.co/functions/v1/send-journey-invite' \
  --header 'Authorization: Bearer <your-anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{
    "journeyId": "some-uuid",
    "inviteeEmail": "friend@example.com",
    "inviterName": "John Doe"
  }'
```

## Local Development

### 1. Start Supabase Locally

```bash
supabase start
```

### 2. Create Local .env File

Create `supabase/.env.local`:

```env
RESEND_API_KEY=re_xxx...
APP_URL=http://localhost:4200
```

### 3. Serve Functions Locally

```bash
supabase functions serve --env-file supabase/.env.local
```

### 4. Test Local Function

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-journey-invite' \
  --header 'Authorization: Bearer <local-anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{
    "journeyId": "some-uuid",
    "inviteeEmail": "friend@example.com"
  }'
```

## Available Functions

### send-journey-invite

Sends email invitations when users invite others to join their trips.

**Features:**
- Automatically detects if invitee has an account
- Sends different emails for existing users vs new users
- Adds existing users as participants automatically
- Includes trip details in the email

**Documentation:** [./functions/send-journey-invite/README.md](./functions/send-journey-invite/README.md)

## Troubleshooting

### "Function not found"

Make sure you've deployed the function:
```bash
supabase functions deploy send-journey-invite
```

### "Missing environment variables"

Check that you've set the required secrets in your Supabase Dashboard:
- `RESEND_API_KEY`
- `APP_URL`

### "Failed to send email"

1. Check your Resend API key is valid
2. Verify your domain in Resend
3. Check the Resend dashboard for error logs
4. For development, use Resend's test domain: `onboarding@resend.dev`

### CORS Errors

Make sure the Edge Function includes proper CORS headers (already configured in the code).

## Email Customization

### Change Sender Email

Edit the function code in `functions/send-journey-invite/index.ts`:

```typescript
from: 'TripTrack <invites@yourdomain.com>',
```

**Note:** You must verify this domain in Resend first.

### Customize Email Templates

The email templates are defined in the Edge Function code. Look for the `emailHtml` variable and customize the HTML/CSS to match your branding.

## Production Checklist

- [ ] Verify your domain in Resend
- [ ] Set production `RESEND_API_KEY` in Supabase secrets
- [ ] Set production `APP_URL` in Supabase secrets
- [ ] Deploy all functions: `supabase functions deploy`
- [ ] Test with real email addresses
- [ ] Set up email monitoring in Resend dashboard

## Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Resend Documentation](https://resend.com/docs)
- [Deno Deploy](https://deno.com/deploy)
