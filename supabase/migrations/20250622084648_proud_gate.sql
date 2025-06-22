-- Ensure the admin user exists with correct data using a single UPSERT
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
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  location = EXCLUDED.location,
  is_active = EXCLUDED.is_active,
  updated_at = EXCLUDED.updated_at;

-- Verify the user exists
SELECT id, email, username, full_name, role, is_active 
FROM admins 
WHERE email = 'admin@quickcart.com';