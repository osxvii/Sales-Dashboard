-- Remove all existing policies
DROP POLICY IF EXISTS "Authenticated users can manage access_logs" ON access_logs;
DROP POLICY IF EXISTS "Allow all access log inserts" ON access_logs;
DROP POLICY IF EXISTS "Allow admin access to logs" ON access_logs;

-- Create simple, permissive policies
CREATE POLICY "Allow all access log operations" ON access_logs 
FOR ALL USING (true) WITH CHECK (true);