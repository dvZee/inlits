/*
  # Fix Earnings Function and Create Affiliate System

  1. Fix ambiguous column reference in get_earnings_overview function
  2. Create affiliate system tables
  3. Create supporting functions for affiliate tracking
  4. Set up proper RLS policies and indexes
*/

-- First, drop the existing get_earnings_overview function if it exists
DROP FUNCTION IF EXISTS get_earnings_overview(uuid);

-- Create the corrected get_earnings_overview function with qualified column names
CREATE OR REPLACE FUNCTION get_earnings_overview(p_creator_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_earnings', COALESCE(SUM(e.amount), 0),
    'this_month', COALESCE(SUM(CASE 
      WHEN e.earned_at >= date_trunc('month', CURRENT_DATE) 
      THEN e.amount 
      ELSE 0 
    END), 0),
    'last_month', COALESCE(SUM(CASE 
      WHEN e.earned_at >= date_trunc('month', CURRENT_DATE - interval '1 month') 
      AND e.earned_at < date_trunc('month', CURRENT_DATE)
      THEN e.amount 
      ELSE 0 
    END), 0),
    'pending_amount', COALESCE(SUM(CASE 
      WHEN e.earned_at >= CURRENT_DATE - interval '30 days'
      THEN e.amount 
      ELSE 0 
    END), 0)
  ) INTO result
  FROM earnings e
  WHERE e.creator_id = p_creator_id;
  
  RETURN result;
END;
$$;

-- Create affiliate_links table
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('article', 'book', 'audiobook', 'podcast')),
  affiliate_code text UNIQUE NOT NULL,
  commission_rate numeric DEFAULT 30.0 NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
  clicks bigint DEFAULT 0 NOT NULL,
  conversions bigint DEFAULT 0 NOT NULL,
  total_earnings numeric DEFAULT 0.0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create affiliate_clicks table
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id uuid REFERENCES public.affiliate_links(id) ON DELETE CASCADE NOT NULL,
  visitor_id text,
  ip_address text,
  user_agent text,
  referrer text,
  clicked_at timestamptz DEFAULT now() NOT NULL
);

-- Create affiliate_conversions table
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id uuid REFERENCES public.affiliate_links(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  purchase_amount numeric NOT NULL CHECK (purchase_amount >= 0),
  commission_amount numeric NOT NULL CHECK (commission_amount >= 0),
  converted_at timestamptz DEFAULT now() NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled'))
);

-- Enable RLS on all affiliate tables
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_links
CREATE POLICY "Creators can manage their own affiliate links"
  ON public.affiliate_links
  FOR ALL
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Anyone can view active affiliate links"
  ON public.affiliate_links
  FOR SELECT
  TO public
  USING (is_active = true);

-- RLS Policies for affiliate_clicks
CREATE POLICY "System can insert clicks"
  ON public.affiliate_clicks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Creators can view clicks for their links"
  ON public.affiliate_clicks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM affiliate_links al 
      WHERE al.id = affiliate_clicks.affiliate_link_id 
      AND al.creator_id = auth.uid()
    )
  );

-- RLS Policies for affiliate_conversions
CREATE POLICY "System can manage conversions"
  ON public.affiliate_conversions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM affiliate_links al 
      WHERE al.id = affiliate_conversions.affiliate_link_id 
      AND al.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM affiliate_links al 
      WHERE al.id = affiliate_conversions.affiliate_link_id 
      AND al.creator_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_links_creator_id ON public.affiliate_links(creator_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_affiliate_code ON public.affiliate_links(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_content ON public.affiliate_links(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_link_id ON public.affiliate_clicks(affiliate_link_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON public.affiliate_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_link_id ON public.affiliate_conversions(affiliate_link_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_buyer_id ON public.affiliate_conversions(buyer_id);

-- Create function to generate unique affiliate codes
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM affiliate_links WHERE affiliate_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Create function to track affiliate clicks
CREATE OR REPLACE FUNCTION track_affiliate_click(
  p_affiliate_code text,
  p_visitor_id text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_referrer text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  link_id uuid;
BEGIN
  -- Get affiliate link ID
  SELECT id INTO link_id
  FROM affiliate_links
  WHERE affiliate_code = p_affiliate_code AND is_active = true;
  
  -- Return false if link not found
  IF link_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Insert click record
  INSERT INTO affiliate_clicks (
    affiliate_link_id,
    visitor_id,
    ip_address,
    user_agent,
    referrer
  ) VALUES (
    link_id,
    p_visitor_id,
    p_ip_address,
    p_user_agent,
    p_referrer
  );
  
  -- Increment click count
  UPDATE affiliate_links
  SET clicks = clicks + 1,
      updated_at = now()
  WHERE id = link_id;
  
  RETURN true;
END;
$$;

-- Create function to process affiliate conversions
CREATE OR REPLACE FUNCTION process_affiliate_conversion(
  p_affiliate_code text,
  p_buyer_id uuid,
  p_purchase_amount numeric
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  link_record record;
  commission_amount numeric;
BEGIN
  -- Get affiliate link details
  SELECT * INTO link_record
  FROM affiliate_links
  WHERE affiliate_code = p_affiliate_code AND is_active = true;
  
  -- Return false if link not found
  IF link_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Calculate commission
  commission_amount := p_purchase_amount * (link_record.commission_rate / 100);
  
  -- Insert conversion record
  INSERT INTO affiliate_conversions (
    affiliate_link_id,
    buyer_id,
    purchase_amount,
    commission_amount
  ) VALUES (
    link_record.id,
    p_buyer_id,
    p_purchase_amount,
    commission_amount
  );
  
  -- Update affiliate link stats
  UPDATE affiliate_links
  SET conversions = conversions + 1,
      total_earnings = total_earnings + commission_amount,
      updated_at = now()
  WHERE id = link_record.id;
  
  -- Add to creator earnings
  INSERT INTO earnings (
    creator_id,
    amount,
    source_type,
    source_id
  ) VALUES (
    link_record.creator_id,
    commission_amount,
    'affiliate_commission',
    link_record.id
  );
  
  RETURN true;
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply trigger to affiliate_links table
DROP TRIGGER IF EXISTS update_affiliate_links_updated_at ON public.affiliate_links;
CREATE TRIGGER update_affiliate_links_updated_at
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();