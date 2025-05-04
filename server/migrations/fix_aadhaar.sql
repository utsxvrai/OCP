-- Add Aadhaar number field to users table
ALTER TABLE users
ADD COLUMN aadhaar_number VARCHAR(12) DEFAULT NULL UNIQUE AFTER email; 