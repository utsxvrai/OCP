-- Add address and pin_code fields to users table if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS pin_code VARCHAR(10);

-- Update existing users
-- This sets default values for existing rows
-- Not needed for new installations, but helpful for updates
UPDATE users
SET address = 'Not provided', pin_code = '000000'
WHERE address IS NULL; 