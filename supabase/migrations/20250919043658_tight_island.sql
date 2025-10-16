/*
  # Fix Affiliate System Commission Control

  1. Database Functions
    - Fix generate_affiliate_code function
    - Update affiliate link creation to use fixed 30% commission
    - Remove user control over commission rates

  2. Security
    - Ensure only platform controls commission rates
    - Maintain proper RLS policies

  3. Changes
    - Fixed commission rate at 30% for all affiliate links
    - Removed user ability to set custom commission rates
    - Fixed database function errors
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS generate_affiliate_code();
DROP FUNCTION IF EXISTS track_affiliate_click(text, uuid, text, text, text);
DROP FUNCTION IF EXISTS process_affiliate_conversion(text, uuid, numeric);

-- Create function to generate unique affiliate codes
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM affiliate_links WHERE affiliate_code = code
    ) INTO exists_check;
    
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
  p_visitor_id uuid DEFAULT NULL,
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
  
  -- If link doesn't exist, return false
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
  
  -- Update click count on affiliate link
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
  link_record affiliate_links%ROWTYPE;
  commission_amount numeric;
BEGIN
  -- Get affiliate link details
  SELECT * INTO link_record
  FROM affiliate_links
  WHERE affiliate_code = p_affiliate_code AND is_active = true;
  
  -- If link doesn't exist, return false
  IF link_record.id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Calculate commission (always 30% for subscription platform)
  commission_amount := p_purchase_amount * 0.30;
  
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
  
  -- Add earnings record for the creator
  INSERT INTO earnings (
    creator_id,
    amount,
    source_type,
    source_id
  ) VALUES (
    link_record.creator_id,
    commission_amount,
    'subscription',
    link_record.id
  );
  
  RETURN true;
END;
$$;