import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
  journeyId: string;
  inviteeEmail: string;
  inviterName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasResendKey: !!resendApiKey,
      appUrl
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable. Please set it in Supabase Dashboard → Settings → Edge Functions');
    }

    // Parse request body
    const { journeyId, inviteeEmail, inviterName }: InviteRequest = await req.json();

    if (!journeyId || !inviteeEmail) {
      return new Response(
        JSON.stringify({ error: 'journeyId and inviteeEmail are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get journey details
    const { data: journey, error: journeyError } = await supabase
      .from('journeys')
      .select('id, title, destination, start_date, end_date, user_id')
      .eq('id', journeyId)
      .single();

    if (journeyError || !journey) {
      return new Response(
        JSON.stringify({ error: 'Journey not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user exists with this email
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', inviteeEmail.toLowerCase())
      .single();

    let emailSubject: string;
    let emailHtml: string;
    let emailText: string;

    if (existingProfile) {
      // User exists - send journey invitation
      // Check if already a participant
      const { data: existingParticipant } = await supabase
        .from('journey_participants')
        .select('id')
        .eq('journey_id', journeyId)
        .eq('user_id', existingProfile.id)
        .single();

      if (existingParticipant) {
        return new Response(
          JSON.stringify({ error: 'User is already a participant' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Add user as participant
      const { error: participantError } = await supabase
        .from('journey_participants')
        .insert({
          journey_id: journeyId,
          user_id: existingProfile.id,
          role: 'participant',
        });

      if (participantError) {
        throw participantError;
      }

      // Email for existing user
      const inviterText = inviterName ? `${inviterName}` : 'Someone';
      const startDate = new Date(journey.start_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const endDate = new Date(journey.end_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      emailSubject = `You've been invited to ${journey.title}`;
      emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">✈️ TripTrack</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #667eea; margin-top: 0;">You've Been Invited!</h2>
              <p style="font-size: 16px; color: #374151;">
                Hi ${existingProfile.full_name || 'there'},
              </p>
              <p style="font-size: 16px; color: #374151;">
                ${inviterText} has invited you to join their trip on TripTrack:
              </p>
              <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">${journey.title}</h3>
                <p style="margin: 5px 0; color: #6b7280;">📍 ${journey.destination}</p>
                <p style="margin: 5px 0; color: #6b7280;">📅 ${startDate} - ${endDate}</p>
              </div>
              <p style="font-size: 16px; color: #374151;">
                View the trip details, see activities, and track the budget together!
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/journeys/${journeyId}" style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  View Trip
                </a>
              </div>
              <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
                Or copy this link: <a href="${appUrl}/journeys/${journeyId}" style="color: #667eea;">${appUrl}/journeys/${journeyId}</a>
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>You're receiving this because someone invited you to a trip on TripTrack.</p>
            </div>
          </body>
        </html>
      `;
      emailText = `You've been invited to ${journey.title}!\n\n${inviterText} has invited you to join their trip:\n\nTrip: ${journey.title}\nDestination: ${journey.destination}\nDates: ${startDate} - ${endDate}\n\nView the trip: ${appUrl}/journeys/${journeyId}`;
    } else {
      // User doesn't exist - send signup invitation
      emailSubject = `You've been invited to join TripTrack`;
      emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">✈️ TripTrack</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #667eea; margin-top: 0;">Join Your Friend's Trip!</h2>
              <p style="font-size: 16px; color: #374151;">
                Hi there,
              </p>
              <p style="font-size: 16px; color: #374151;">
                ${inviterName || 'Someone'} wants you to join their trip on TripTrack:
              </p>
              <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">${journey.title}</h3>
                <p style="margin: 5px 0; color: #6b7280;">📍 ${journey.destination}</p>
              </div>
              <p style="font-size: 16px; color: #374151;">
                TripTrack helps groups plan trips together - track activities, budgets, and share memories all in one place.
              </p>
              <p style="font-size: 16px; color: #374151;">
                <strong>Create your free account to join the trip!</strong>
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/signup?email=${encodeURIComponent(inviteeEmail)}&journey=${journeyId}" style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Sign Up & Join Trip
                </a>
              </div>
              <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
                Already have an account? <a href="${appUrl}/login?journey=${journeyId}" style="color: #667eea;">Log in here</a>
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>You're receiving this because someone invited you to a trip on TripTrack.</p>
            </div>
          </body>
        </html>
      `;
      emailText = `You've been invited to join TripTrack!\n\n${inviterName || 'Someone'} wants you to join their trip: ${journey.title} to ${journey.destination}\n\nCreate your free account to join: ${appUrl}/signup?email=${encodeURIComponent(inviteeEmail)}&journey=${journeyId}`;
    }

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'TripTrack <invites@triptrack.xyz>',
        to: [inviteeEmail],
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error('Resend API error:', error);
      console.error('Resend status:', resendResponse.status);
      throw new Error(`Failed to send email: ${error}`);
    }

    const resendData = await resendResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        userExists: !!existingProfile,
        participantAdded: !!existingProfile,
        emailId: resendData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-journey-invite:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
