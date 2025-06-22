/*
  # Create default admin user for login

  1. Insert default admin user
    - Email: admin@quickcart.com
    - Username: admin
    - Full name: Default Administrator
    - Role: super_admin
    - Active status: true

  2. Handle conflicts gracefully
    - Update existing user if email already exists
    - Ensure user is active and has correct permissions
*/

-- Insert or update the default admin user
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
  gen_random_uuid(),
  'admin@quickcart.com',
  'admin',
  'Default Administrator',
  'super_admin',
  'System',
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  role = 'super_admin',
  full_name = 'Default Administrator',
  username = 'admin',
  updated_at = now();

-- Verify the admin user exists
SELECT id, email, username, full_name, role, is_active 
FROM admins 
WHERE email = 'admin@quickcart.com';