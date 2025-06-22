-- Allow admin record creation
DROP POLICY IF EXISTS "Authenticated users can manage admins" ON admins;
CREATE POLICY "Allow admin creation" ON admins 
FOR INSERT TO anon 
WITH CHECK (email = 'admin@quickcart.com');

-- Allow access logs to reference the admin
ALTER TABLE access_logs DROP CONSTRAINT IF EXISTS access_logs_admin_id_fkey;
ALTER TABLE access_logs ADD CONSTRAINT access_logs_admin_id_fkey 
FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL;