-- Add Aadhaar number field to users table
ALTER TABLE users
ADD COLUMN aadhaar_number VARCHAR(12) DEFAULT NULL UNIQUE AFTER email;

-- Update schema version
INSERT INTO schema_version (version, description, applied_at)
VALUES ('1.2', 'Add Aadhaar number to users table', NOW()); 