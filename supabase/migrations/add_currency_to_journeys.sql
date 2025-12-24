-- Add currency column to journeys table
-- This allows each journey to have its own currency for budgeting and expenses

-- Add currency column with default USD
ALTER TABLE journeys
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';

-- Add check constraint for supported currencies
ALTER TABLE journeys
ADD CONSTRAINT journeys_currency_check
CHECK (currency IN (
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY',
  'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY',
  'INR', 'RUB', 'BRL', 'ZAR', 'DKK', 'PLN', 'THB', 'IDR',
  'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'SAR',
  'MYR', 'RON', 'ARS', 'VND', 'KES', 'NGN', 'EGP', 'PKR'
));

-- Add comment
COMMENT ON COLUMN journeys.currency IS 'Currency code (ISO 4217) for journey budget and expenses';
