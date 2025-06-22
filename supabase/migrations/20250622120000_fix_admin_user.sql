BEGIN;

-- Single consistent admin user setup
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

-- Fix RLS policies for access logs
DROP POLICY IF EXISTS "Authenticated users can manage access_logs" ON access_logs;

CREATE POLICY "Allow all access log inserts" ON access_logs 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin access to logs" ON access_logs 
FOR SELECT TO authenticated USING (true);

COMMIT;