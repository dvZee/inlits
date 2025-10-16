/*
  # Debug and Fix Affiliate Functions
  
  1. Check Function Existence
    - Verify generate_affiliate_code function exists
    - Check function permissions and return type
  
  2. Fix Function Issues
    - Ensure proper return type
    - Add better error handling
    - Test function execution
*/

-- First, check if the function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'generate_affiliate_code'
  ) THEN
    RAISE NOTICE 'Function generate_affiliate_code does not exist, creating it...';
  ELSE
    RAISE NOTICE 'Function generate_affiliate_code exists, recreating it...';
  END IF;
END $$;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS generate_affiliate_code();

-- Create the function with proper error handling
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code TEXT;
  attempts INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    IF NOT EXISTS (
      SELECT 1 FROM affiliate_links WHERE affiliate_code = code
    ) THEN
      RETURN code;
    END IF;
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique affiliate code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$;

-- Test the function
DO $$
DECLARE
  test_code TEXT;
BEGIN
  test_code := generate_affiliate_code();
  RAISE NOTICE 'Generated test affiliate code: %', test_code;
  
  IF test_code IS NULL OR length(test_code) != 8 THEN
    RAISE EXCEPTION 'Function test failed: Invalid code generated';
  END IF;
  
  RAISE NOTICE 'Function test passed successfully';
END $$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_affiliate_code() TO authenticated;

-- Also ensure the affiliate_links table exists with proper structure
CREATE TABLE IF NOT EXISTS affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('article', 'book', 'audiobook', 'podcast')),
  affiliate_code text UNIQUE NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 30.0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  clicks bigint NOT NULL DEFAULT 0,
  conversions bigint NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0.0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'affiliate_links' AND policyname = 'Creators can manage their own affiliate links'
  ) THEN
    CREATE POLICY "Creators can manage their own affiliate links"
      ON affiliate_links
      FOR ALL
      TO authenticated
      USING (uid() = creator_id)
      WITH CHECK (uid() = creator_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'affiliate_links' AND policyname = 'Anyone can view active affiliate links'
  ) THEN
    CREATE POLICY "Anyone can view active affiliate links"
      ON affiliate_links
      FOR SELECT
      TO public
      USING (is_active = true);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_links_creator_id ON affiliate_links(creator_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_affiliate_code ON affiliate_links(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_content ON affiliate_links(content_id, content_type);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_affiliate_links_updated_at ON affiliate_links;
CREATE TRIGGER update_affiliate_links_updated_at
  BEFORE UPDATE ON affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();