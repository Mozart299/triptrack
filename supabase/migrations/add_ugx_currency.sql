-- Add Ugandan Shilling support to the journey currency constraint.

ALTER TABLE journeys
DROP CONSTRAINT IF EXISTS journeys_currency_check;

ALTER TABLE journeys
ADD CONSTRAINT journeys_currency_check
CHECK (currency IN (
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY',
  'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY',
  'INR', 'RUB', 'BRL', 'ZAR', 'DKK', 'PLN', 'THB', 'IDR',
  'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'SAR',
  'MYR', 'RON', 'ARS', 'VND', 'UGX', 'KES', 'NGN', 'EGP', 'PKR'
));
