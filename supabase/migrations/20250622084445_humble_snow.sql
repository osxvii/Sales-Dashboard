/*
  # Ensure default admin user exists for login

  1. Check and insert default admin user
    - Email: admin@quickcart.com
    - Username: admin
    - Full name: System Administrator
    - Role: super_admin
    - Active status: true

  2. Update existing user if needed
    - Ensure the user is active
    - Set proper role and details
*/

-- First, let's check if the user exists and update/insert accordingly
DO $$
BEGIN
  -- Check if admin user exists
  IF NOT EXISTS (SELECT 1 FROM admins WHERE email = 'admin@quickcart.com') THEN
    -- Insert new admin user
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
    );
  ELSE
    -- Update existing user to ensure it's active and has correct details
    UPDATE admins 
    SET 
      is_active = true,
      role = 'super_admin',
      full_name = 'System Administrator',
      username = 'admin',
      updated_at = now()
    WHERE email = 'admin@quickcart.com';
  END IF;
END $$;

-- Verify the user exists
SELECT id, email, username, full_name, role, is_active 
FROM admins 
WHERE email = 'admin@quickcart.com';