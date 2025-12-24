# Database Migrations

## Running Migrations

### Option 1: Using Supabase CLI (Recommended)
```bash
# Make sure you're in the project root
cd /path/to/triptrack

# Run the migration
supabase db push
```

### Option 2: Manual SQL Execution
If you don't have the Supabase CLI, you can run the migration manually:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `add_currency_to_journeys.sql`
4. Click "Run" to execute the migration

## Migrations in this folder

- `add_currency_to_journeys.sql` - Adds currency field to journeys table with support for 40+ currencies

## After Running Migrations

After running the migration, all existing journeys will default to USD. Users can:
1. Edit existing journeys to change the currency
2. Create new journeys with any supported currency

The currency selection is available in:
- Journey creation form
- Journey edit form

Currency symbols will automatically display throughout the app based on the journey's selected currency.
