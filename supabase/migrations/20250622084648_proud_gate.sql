-- Ensure the admin user exists with correct data
INSERT INTO admins (
  id,
  email,
  username,
  full_name,
  role,
  location,
  is_active,
  created_at,
  updated_at
) VALUES (
  '770e8400-e29b-41d4-a716-446655440000',
  'admin@quickcart.com',
  'admin',
  'System Administrator',
  'super_admin',
  'System',
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  role = 'super_admin',
  full_name = 'System Administrator',
  username = 'admin',
  updated_at = now();

-- Also ensure the original admin user from the seed data exists
INSERT INTO admins (
  id,
  email,
  username,
  full_name,
  role,
  location,
  is_active,
  created_at,
  updated_at
) VALUES (
  '770e8400-e29b-41d4-a716-446655440001',
  'admin@quickcart.com',
  'admin_master',
  'John Anderson',
  'super_admin',
  'New York, USA',
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  role = 'super_admin',
  updated_at = now();

-- Verify the user exists
SELECT id, email, username, full_name, role, is_active 
FROM admins 
WHERE email = 'admin@quickcart.com';