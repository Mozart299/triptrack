/**
 * Nairobi Trip Seed Data
 *
 * This script pre-populates your Nairobi trip with:
 * - Journey details (Dec 24 - Dec 28, 2025)
 * - 4 people itinerary
 * - Activities from planned itinerary
 * - Budget breakdown
 *
 * Usage:
 * 1. Set your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * 2. Run: npm run seed:nairobi <your-user-id>
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// KES to USD conversion (approximate)
const KES_TO_USD = 0.0077;

async function seedNairobiTrip(userId: string) {
  console.log('🌍 Starting Nairobi trip seed...\n');

  // 1. Create the journey
  console.log('Creating journey...');
  const { data: journey, error: journeyError } = await supabase
    .from('journeys')
    .insert({
      user_id: userId,
      title: 'Nairobi Adventure 2025',
      description: '5-day adventure in Nairobi with friends - Dec 24-28, 2025',
      destination: 'Nairobi, Kenya',
      start_date: '2025-12-24',
      end_date: '2025-12-28',
      status: 'planning',
    })
    .select()
    .single();

  if (journeyError) {
    console.error('Error creating journey:', journeyError);
    return;
  }

  console.log('✅ Journey created:', journey.title);

  // 2. Add owner as participant
  await supabase.from('journey_participants').insert({
    journey_id: journey.id,
    user_id: userId,
    role: 'owner',
  });

  console.log('✅ Added you as journey owner\n');

  // 3. Create activities based on the planned itinerary
  console.log('Creating activities from itinerary...');
  const activities = [
    // DAY 1 - Dec 24 (Christmas Eve)
    {
      title: 'Museum of Illusions',
      description: 'Interactive, photo-friendly museum experience at Laxcon Court, Parklands. Duration: 2 hours',
      location: 'Laxcon Court, Parklands Road',
      category: 'entertainment',
      scheduled_at: '2025-12-24T10:00:00+03:00',
    },
    {
      title: 'Bowling at Village Bowl',
      description: 'Bowling session at Village Market, Gigiri',
      location: 'Village Bowl, Village Market, Gigiri',
      category: 'entertainment',
      scheduled_at: '2025-12-24T15:00:00+03:00',
    },
    {
      title: 'Christmas Eve Dinner & Drinks',
      description: 'Christmas Eve dinner at Brew Bistro or The Alchemist Bar',
      location: 'Westlands',
      category: 'dining',
      scheduled_at: '2025-12-24T20:00:00+03:00',
    },

    // DAY 2 - Dec 25 (Christmas Day)
    {
      title: 'Nairobi National Park Safari',
      description: 'Half-day shared safari tour. See lions, giraffes, rhinos, zebras, and more! Duration: 4-5 hours',
      location: 'Nairobi National Park',
      category: 'sightseeing',
      scheduled_at: '2025-12-25T06:00:00+03:00',
    },
    {
      title: 'Lunch at Carnivore Restaurant',
      description: 'Famous nyama choma restaurant',
      location: 'Carnivore Restaurant',
      category: 'dining',
      scheduled_at: '2025-12-25T13:00:00+03:00',
    },
    {
      title: 'Eye of Kenya Ferris Wheel',
      description: '17-minute ride with panoramic views of Nairobi',
      location: 'Two Rivers Mall, Ruaka',
      category: 'entertainment',
      scheduled_at: '2025-12-25T15:00:00+03:00',
    },
    {
      title: 'Indoor Games at Funscapes',
      description: 'Arcade games, VR, pool tables at Two Rivers Mall',
      location: 'Two Rivers Mall Funscapes',
      category: 'entertainment',
      scheduled_at: '2025-12-25T16:00:00+03:00',
    },
    {
      title: 'Christmas Dinner',
      description: 'Special Christmas dinner celebration',
      location: 'K1 Klub House or Sankara Nairobi',
      category: 'dining',
      scheduled_at: '2025-12-25T19:00:00+03:00',
    },

    // DAY 3 - Dec 26 (Boxing Day)
    {
      title: 'Horse Riding Adventure',
      description: '1-2 hour horse riding experience through forest trails',
      location: 'Tigoni Horse Trail, Limuru (or Kereita Forest)',
      category: 'sightseeing',
      scheduled_at: '2025-12-26T08:00:00+03:00',
    },
    {
      title: 'Lunch at Karen Blixen Coffee Garden',
      description: 'Lunch at scenic Karen location',
      location: 'Karen Blixen Coffee Garden',
      category: 'dining',
      scheduled_at: '2025-12-26T13:00:00+03:00',
    },
    {
      title: 'Swimming at Clarence House Rooftop Pool',
      description: 'Heated rooftop pool with city views. Duration: 3 hours',
      location: 'Clarence House Hotel, Westlands',
      category: 'entertainment',
      scheduled_at: '2025-12-26T14:00:00+03:00',
    },
    {
      title: 'Boxing Day Night Out',
      description: 'Big night out at premium club - B Club or SPACE Lounge',
      location: 'B Club (ABC Place) or SPACE Lounge (Westlands)',
      category: 'entertainment',
      scheduled_at: '2025-12-26T22:00:00+03:00',
    },

    // DAY 4 - Dec 27 (Friday)
    {
      title: 'Ice Skating at Solar Ice Rink',
      description: "East Africa's only ice rink! Duration: 2 hours, includes skating boots",
      location: 'Panari Hotel, Mombasa Road',
      category: 'entertainment',
      scheduled_at: '2025-12-27T14:00:00+03:00',
    },
    {
      title: 'Shopping & Souvenirs',
      description: 'Souvenir shopping at City Market or Maasai Market',
      location: 'City Market or Maasai Market',
      category: 'other',
      scheduled_at: '2025-12-27T16:00:00+03:00',
    },
    {
      title: 'Friday Night Out',
      description: 'Premium club night - Privee, Geco Lounge, or rooftop bar hopping',
      location: 'Westlands (Skyluxx → Privee/Geco)',
      category: 'entertainment',
      scheduled_at: '2025-12-27T22:00:00+03:00',
    },

    // DAY 5 - Dec 28 (Saturday - Departure Day)
    {
      title: 'Bomas of Kenya Cultural Show',
      description: 'Traditional dances and cultural performances (if time permits)',
      location: 'Bomas of Kenya',
      category: 'sightseeing',
      scheduled_at: '2025-12-28T09:00:00+03:00',
    },
    {
      title: 'Checkout & Departure',
      description: 'Hotel checkout and airport transfer',
      location: 'Jomo Kenyatta International Airport',
      category: 'transport',
      scheduled_at: '2025-12-28T13:00:00+03:00',
    },
  ];

  // Estimates in KES used for planning (not written to DB unless schema updated)
  const activityEstimatesKES: Record<string, number> = {
    'Museum of Illusions': 6000,
    'Bowling at Village Bowl': 3200,
    'Nairobi National Park Safari': 16000,
    'Eye of Kenya Ferris Wheel': 2000,
    'Indoor Games at Funscapes': 4000,
    'Horse Riding Adventure': 8000,
    'Swimming at Clarence House Rooftop Pool': 4000,
    'Ice Skating at Solar Ice Rink': 6000,
    'Bomas of Kenya Cultural Show': 4000,
  };

  const { data: createdActivities, error: activitiesError } = await supabase
    .from('activities')
    .insert(
      activities.map((activity) => {
        const kes = activityEstimatesKES[activity.title] ?? null;
        const estimated_cost = kes ? Math.round(kes * KES_TO_USD * 100) / 100 : null;
        return {
          ...activity,
          journey_id: journey.id,
          user_id: userId,
          estimated_cost,
        };
      })
    )
    .select();

  // Attach local estimated_cost (USD) to created activities for planning display
  const createdActivitiesWithEstimates = (createdActivities || []).map((a: any) => {
    const kes = activityEstimatesKES[a.title] ?? null;
    const estimated_cost = kes ? Math.round(kes * KES_TO_USD * 100) / 100 : null;
    return { ...a, estimated_cost };
  });

  if (activitiesError) {
    console.error('Error creating activities:', activitiesError);
  } else {
    console.log(`✅ Created ${createdActivities.length} activities\n`);
    const totalEstimatedFromActivities = createdActivitiesWithEstimates.reduce((sum, a) => sum + (a.estimated_cost || 0), 0);
    console.log('Estimated total for activities (USD):', totalEstimatedFromActivities.toFixed(2));
    console.log('Estimated total for activities (KES):', Math.round(totalEstimatedFromActivities / KES_TO_USD));
  }

  // 4. Create expenses based on budget breakdown
  console.log('Creating expenses from budget...');
  const expenses = [
    // Activities Expenses
    {
      title: 'Museum of Illusions (4 people)',
      amount: Math.round(6000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'activities',
      paid_by: userId,
      notes: 'Ksh 6,000 - Ksh 1,500/person',
    },
    {
      title: 'Bowling at Village Bowl (4 people)',
      amount: Math.round(3200 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'activities',
      paid_by: userId,
      notes: 'Ksh 3,200 - Ksh 800/person peak hours',
    },
    {
      title: 'Nairobi National Park Safari (shared tour, 4 people)',
      amount: Math.round(16000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'activities',
      paid_by: userId,
      notes: 'Ksh 16,000 - Ksh 4,000/person group tour',
    },
    {
      title: 'Eye of Kenya Ferris Wheel (4 people)',
      amount: Math.round(2000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'activities',
      paid_by: userId,
      notes: 'Ksh 2,000 - Ksh 500/person',
    },
    {
      title: 'Two Rivers Indoor Games (4 people)',
      amount: Math.round(4000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'activities',
      paid_by: userId,
      notes: 'Ksh 4,000 - arcade, VR, pool',
    },
    {
      title: 'Horse Riding - Tigoni (4 people, 1 hour)',
      amount: Math.round(8000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'activities',
      paid_by: userId,
      notes: 'Ksh 8,000 - Ksh 2,000/person',
    },
    {
      title: 'Swimming at Clarence House Rooftop Pool (4 people)',
      amount: Math.round(4000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'activities',
      paid_by: userId,
      notes: 'Ksh 4,000 - Ksh 1,000/person',
    },
    {
      title: 'Ice Skating at Panari Hotel (4 people)',
      amount: Math.round(6000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'activities',
      paid_by: userId,
      notes: 'Ksh 6,000 - Ksh 1,500/person including boots',
    },
    {
      title: 'Bomas of Kenya Cultural Show (4 people)',
      amount: Math.round(4000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'activities',
      paid_by: userId,
      notes: 'Ksh 4,000 - Ksh 1,000/person',
    },

    // Food & Dining
    {
      title: 'Christmas Eve Dinner at Brew Bistro',
      amount: Math.round(12000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'food',
      paid_by: userId,
      notes: 'Ksh 12,000 - dinner + drinks for 4',
    },
    {
      title: 'Lunch at Carnivore Restaurant',
      amount: Math.round(8000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'food',
      paid_by: userId,
      notes: 'Ksh 8,000 - famous nyama choma',
    },
    {
      title: 'Christmas Dinner',
      amount: Math.round(15000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'food',
      paid_by: userId,
      notes: 'Ksh 15,000 - special Christmas menu',
    },
    {
      title: 'Lunch at Karen Blixen Coffee Garden',
      amount: Math.round(6000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'food',
      paid_by: userId,
      notes: 'Ksh 6,000',
    },

    // Nightlife
    {
      title: 'Boxing Day Night Out (B Club/SPACE)',
      amount: Math.round(20000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'other',
      paid_by: userId,
      notes: 'Ksh 20,000 - entry, drinks, food for 4',
    },
    {
      title: 'Friday Night Out (Premium clubs)',
      amount: Math.round(25000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'other',
      paid_by: userId,
      notes: 'Ksh 25,000 - rooftop bar + club for 4',
    },

    // Shopping
    {
      title: 'Souvenirs & Shopping',
      amount: Math.round(10000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'shopping',
      paid_by: userId,
      notes: 'Ksh 10,000 - City Market/Maasai Market',
    },

    // Transport
    {
      title: 'Airport Transfers (Round trip)',
      amount: Math.round(4000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'transport',
      paid_by: userId,
      notes: 'Ksh 4,000 - Uber/taxi both ways',
    },
    {
      title: 'Local Transport (Uber/Bolt)',
      amount: Math.round(8000 * KES_TO_USD * 100) / 100,
      currency: 'USD',
      category: 'transport',
      paid_by: userId,
      notes: 'Ksh 8,000 - estimated for 5 days',
    },
  ];

  const { data: createdExpenses, error: expensesError } = await supabase
    .from('expenses')
    .insert(
      expenses.map((expense) => ({
        ...expense,
        journey_id: journey.id,
        user_id: userId,
        split_with: [], // Will add friends later when they join
      }))
    )
    .select();

  if (expensesError) {
    console.error('Error creating expenses:', expensesError);
  } else {
    console.log(`✅ Created ${createdExpenses.length} expenses\n`);
  }

  // Calculate totals
  const totalExpenses = createdExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const totalKES = Math.round(totalExpenses / KES_TO_USD);

  console.log('🎉 Nairobi trip seed complete!\n');
  console.log('📊 Summary:');
  console.log(`   Journey: ${journey.title}`);
  console.log(`   Dates: Dec 24-28, 2025 (5 days)`);
  console.log(`   Activities: ${createdActivities?.length || 0}`);
  console.log(`   Expenses: ${createdExpenses?.length || 0}`);
  console.log(`   Total Budget: $${totalExpenses.toFixed(2)} (Ksh ${totalKES.toLocaleString()})`);
  console.log(`   Per Person: $${(totalExpenses / 4).toFixed(2)} (Ksh ${Math.round(totalKES / 4).toLocaleString()})`);
  console.log('\n💡 Next steps:');
  console.log('   1. Visit the app to see your trip: /journeys/' + journey.id);
  console.log('   2. Invite your 3 friends to join the trip');
  console.log('   3. Update expense splits once friends are added');
  console.log('   4. Start planning and checking off activities!');
}

// Get user ID from command line
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Error: User ID required');
  console.log('\nUsage: npm run seed:nairobi <your-user-id>');
  console.log('\nTo get your user ID:');
  console.log('1. Sign up/login to the app');
  console.log('2. Check your Supabase Dashboard → Authentication → Users');
  console.log('3. Copy your User UID');
  process.exit(1);
}

console.log(`Starting seed for user: ${userId}\n`);

seedNairobiTrip(userId)
  .then(() => {
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });
