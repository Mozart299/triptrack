-- Add explicit payer tracking to activities.
-- Existing activities fall back to the activity creator.

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS paid_by UUID REFERENCES profiles(id);

UPDATE activities
SET paid_by = user_id
WHERE paid_by IS NULL;

COMMENT ON COLUMN activities.paid_by IS 'Participant who paid for the activity cost; falls back to user_id for older rows.';
