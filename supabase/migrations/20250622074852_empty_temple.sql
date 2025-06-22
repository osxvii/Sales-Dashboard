/*
  # Fix login errors and access logs RLS policies

  1. Database Setup
    - Insert default admin user for testing
    - Update RLS policies for access_logs table to allow proper logging

  2. Security Updates
    - Allow INSERT operations on access_logs for both anonymous and authenticated users
    - This enables proper login attempt logging regardless of authentication status

  3. Data Initialization
    - Create default admin user: admin@quickcart.com
    - Set appropriate default values for all required fields
*/

-- Insert default admin user if it doesn't exist
INSERT INTO admins (
  email,
  username,
  full_name,
  role,
  location,
  is_active
) VALUES (
  'admin@quickcart.com',
  'admin',
  'System Administrator',
  'admin',
  'System',
  true
) ON CONFLICT (email) DO NOTHING;

-- Drop existing access_logs policies
DROP POLICY IF EXISTS "Authenticated users can manage access_logs" ON access_logs;

-- Create new RLS policies for access_logs that allow proper logging
CREATE POLICY "Allow INSERT for access logging"
  ON access_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow SELECT for authenticated users"
  ON access_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow UPDATE for authenticated users"
  ON access_logs
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow DELETE for authenticated users"
  ON access_logs
  FOR DELETE
  TO authenticated
  USING (true);