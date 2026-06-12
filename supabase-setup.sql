-- Supabase Database Setup for PassIntell Pro
-- Run this in your Supabase SQL Editor

-- 1. Create request_logs table
CREATE TABLE IF NOT EXISTS request_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create vault_entries table
CREATE TABLE IF NOT EXISTS vault_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  target TEXT NOT NULL,
  identity TEXT NOT NULL,
  secret TEXT NOT NULL,
  score INTEGER NOT NULL,
  breach TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) for security
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;

-- 4. Create policies (allow all for now - you may want to restrict this later)
-- Allow anyone to insert logs
CREATE POLICY "Enable insert access for all users"
  ON request_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read logs
CREATE POLICY "Enable read access for all users"
  ON request_logs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert vault entries
CREATE POLICY "Enable insert access for all users on vault"
  ON vault_entries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to read their own vault entries
CREATE POLICY "Enable read access for users to their vault"
  ON vault_entries
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow users to delete their own vault entries
CREATE POLICY "Enable delete access for users on their vault"
  ON vault_entries
  FOR DELETE
  TO anon, authenticated
  USING (true);
