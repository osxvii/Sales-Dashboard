-- Ensure username is 'admin'
UPDATE admins 
SET 
  username = 'admin',
  updated_at = now()
WHERE email = 'admin@quickcart.com';

-- Remove any conflicting admin records
DELETE FROM admins 
WHERE email = 'admin@quickcart.com' 
AND id != '770e8400-e29b-41d4-a716-446655440000';