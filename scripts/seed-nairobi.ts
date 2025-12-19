/**
 * Nairobi Trip Seed Data
 *
 * This script pre-populates your Nairobi trip with:
 * - Journey details (Dec 24 - Dec 31)
 * - 4 friends as participants
 * - Pre-planned activities and itinerary
 * - Budget categories
 *
 * Usage:
 * 1. Set your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 * 2. Run: npx tsx scripts/seed-nairobi.ts <your-user-id>
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedNairobiTrip(userId: string) {
  console.log('🌍 Starting Nairobi trip seed...\n');

  // 1. Create the journey
  console.log('Creating journey...');
  const { data: journey, error: journeyError } = await supabase
    .from('journeys')
    .insert({
      user_id: userId,
      title: 'Nairobi Adventure 2024',
      description: 'Epic week-long adventure in Nairobi with the crew!',
      destination: 'Nairobi, Kenya',
      start_date: '2024-12-24',
      end_date: '2024-12-31',
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

  // 3. Create activities
  console.log('Creating activities...');
  const activities = [
    {
      title: 'Arrival & Hotel Check-in',
      description: 'Arrive at Jomo Kenyatta International Airport, transfer to hotel',
      location: 'Nairobi Serena Hotel',
      category: 'accommodation',
      scheduled_at: '2024-12-24T14:00:00Z',
    },
    {
      title: 'Welcome Dinner',
      description: 'Team dinner at Carnivore Restaurant',
      location: 'Carnivore Restaurant',
      category: 'dining',
      scheduled_at: '2024-12-24T19:00:00Z',
    },
    {
      title: 'Nairobi National Park Safari',
      description: 'Morning game drive - see lions, giraffes, and rhinos!',
      location: 'Nairobi National Park',
      category: 'sightseeing',
      scheduled_at: '2024-12-25T06:00:00Z',
    },
    {
      title: 'Giraffe Centre Visit',
      description: 'Feed and interact with endangered Rothschild giraffes',
      location: 'Giraffe Centre',
      category: 'sightseeing',
      scheduled_at: '2024-12-25T14:00:00Z',
    },
    {
      title: 'Karen Blixen Museum',
      description: 'Visit the historic home of Out of Africa author',
      location: 'Karen Blixen Museum',
      category: 'sightseeing',
      scheduled_at: '2024-12-26T10:00:00Z',
    },
    {
      title: 'Kazuri Beads Workshop',
      description: 'Shop for handmade beads and pottery',
      location: 'Kazuri Beads',
      category: 'shopping',
      scheduled_at: '2024-12-26T14:00:00Z',
    },
    {
      title: 'Maasai Market Shopping',
      description: 'Browse local crafts, jewelry, and souvenirs',
      location: 'Maasai Market',
      category: 'shopping',
      scheduled_at: '2024-12-27T10:00:00Z',
    },
    {
      title: 'Bomas of Kenya Cultural Show',
      description: 'Experience traditional dances and cultural performances',
      location: 'Bomas of Kenya',
      category: 'entertainment',
      scheduled_at: '2024-12-27T15:00:00Z',
    },
    {
      title: 'David Sheldrick Wildlife Trust',
      description: 'Visit baby elephant orphanage',
      location: 'David Sheldrick Wildlife Trust',
      category: 'sightseeing',
      scheduled_at: '2024-12-28T11:00:00Z',
    },
    {
      title: 'Rooftop Dinner at Tamarind',
      description: 'Seafood dinner with city views',
      location: 'Tamarind Nairobi',
      category: 'dining',
      scheduled_at: '2024-12-28T19:00:00Z',
    },
    {
      title: 'City Walking Tour',
      description: 'Explore downtown Nairobi, Kenyatta Avenue, Parliament',
      location: 'Nairobi CBD',
      category: 'sightseeing',
      scheduled_at: '2024-12-29T09:00:00Z',
    },
    {
      title: 'Lunch at Java House',
      description: 'Popular local cafe chain',
      location: 'Java House',
      category: 'dining',
      scheduled_at: '2024-12-29T13:00:00Z',
    },
    {
      title: 'Ngong Hills Hike',
      description: 'Scenic hike with panoramic views of the Great Rift Valley',
      location: 'Ngong Hills',
      category: 'sightseeing',
      scheduled_at: '2024-12-30T07:00:00Z',
    },
    {
      title: 'Farewell Dinner',
      description: 'Final group dinner at Talisman Restaurant',
      location: 'Talisman Restaurant',
      category: 'dining',
      scheduled_at: '2024-12-30T19:00:00Z',
    },
    {
      title: 'Hotel Checkout & Airport Transfer',
      description: 'Check out and head to airport',
      location: 'Jomo Kenyatta International Airport',
      category: 'transport',
      scheduled_at: '2024-12-31T10:00:00Z',
    },
  ];

  const { data: createdActivities, error: activitiesError } = await supabase
    .from('activities')
    .insert(
      activities.map((activity) => ({
        ...activity,
        journey_id: journey.id,
        user_id: userId,
      }))
    )
    .select();

  if (activitiesError) {
    console.error('Error creating activities:', activitiesError);
  } else {
    console.log(`✅ Created ${createdActivities.length} activities\n`);
  }

  // 4. Create sample expenses
  console.log('Creating sample budget items...');
  const expenses = [
    {
      title: 'Hotel Booking (7 nights)',
      amount: 1400,
      currency: 'USD',
      category: 'accommodation',
      paid_by: userId,
      notes: 'Nairobi Serena Hotel - $200/night',
    },
    {
      title: 'Flight Tickets',
      amount: 850,
      currency: 'USD',
      category: 'transport',
      paid_by: userId,
      notes: 'Round trip airfare',
    },
    {
      title: 'Airport Transfer',
      amount: 50,
      currency: 'USD',
      category: 'transport',
      paid_by: userId,
    },
  ];

  const { data: createdExpenses, error: expensesError } = await supabase
    .from('expenses')
    .insert(
      expenses.map((expense) => ({
        ...expense,
        journey_id: journey.id,
        user_id: userId,
        split_with: [], // Will add friends later
      }))
    )
    .select();

  if (expensesError) {
    console.error('Error creating expenses:', expensesError);
  } else {
    console.log(`✅ Created ${createdExpenses.length} sample expenses\n`);
  }

  console.log('🎉 Nairobi trip seed complete!');
  console.log('\n📊 Summary:');
  console.log(`   Journey: ${journey.title}`);
  console.log(`   Dates: Dec 24 - 31, 2024`);
  console.log(`   Activities: ${createdActivities?.length || 0}`);
  console.log(`   Sample Expenses: ${createdExpenses?.length || 0}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Invite your 4 friends to join the trip');
  console.log('   2. Update expense splits once friends are added');
  console.log('   3. Start checking in to activities!');
}

// Get user ID from command line
const userId = process.argv[2];

if (!userId) {
  console.error('Usage: npx tsx scripts/seed-nairobi.ts <your-user-id>');
  console.log('\nTo get your user ID:');
  console.log('1. Sign up/login to the app');
  console.log('2. Check your Supabase auth.users table');
  console.log('3. Or run this in browser console after logging in:');
  console.log('   (await supabase.auth.getUser()).data.user.id');
  process.exit(1);
}

seedNairobiTrip(userId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
