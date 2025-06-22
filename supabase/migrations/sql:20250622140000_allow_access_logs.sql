-- Fix RLS policies for access logs
DROP POLICY IF EXISTS "Authenticated users can manage access_logs" ON access_logs;

CREATE POLICY "Allow all access log inserts" ON access_logs 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin access to logs" ON access_logs 
FOR SELECT TO authenticated USING (true);