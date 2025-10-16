/*
  # Fix Earnings Functions - Resolve Ambiguous Column References

  1. Functions Fixed
    - get_earnings_overview: Fixed ambiguous creator_id references
    - get_earnings_by_source: Fixed ambiguous creator_id references  
    - get_earnings_history: Fixed ambiguous creator_id references

  2. Changes Made
    - Qualified all creator_id columns with proper table aliases
    - Maintained all existing functionality
    - Fixed SQL ambiguity errors
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS get_earnings_overview(uuid);
DROP FUNCTION IF EXISTS get_earnings_by_source(uuid);
DROP FUNCTION IF EXISTS get_earnings_history(uuid, integer, integer);

-- Recreate get_earnings_overview with fixed column references
CREATE OR REPLACE FUNCTION get_earnings_overview(creator_id uuid)
RETURNS TABLE (
  total_earnings numeric,
  earnings_growth numeric,
  monthly_revenue numeric,
  monthly_growth numeric,
  pending_payouts numeric,
  available_balance numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(e.amount), 0) as total_earnings,
    COALESCE(
      CASE 
        WHEN LAG(SUM(e.amount)) OVER (ORDER BY DATE_TRUNC('month', e.earned_at)) > 0 
        THEN ((SUM(e.amount) - LAG(SUM(e.amount)) OVER (ORDER BY DATE_TRUNC('month', e.earned_at))) / LAG(SUM(e.amount)) OVER (ORDER BY DATE_TRUNC('month', e.earned_at))) * 100
        ELSE 0 
      END, 0
    ) as earnings_growth,
    COALESCE(SUM(CASE WHEN DATE_TRUNC('month', e.earned_at) = DATE_TRUNC('month', CURRENT_DATE) THEN e.amount ELSE 0 END), 0) as monthly_revenue,
    COALESCE(
      CASE 
        WHEN SUM(CASE WHEN DATE_TRUNC('month', e.earned_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN e.amount ELSE 0 END) > 0
        THEN ((SUM(CASE WHEN DATE_TRUNC('month', e.earned_at) = DATE_TRUNC('month', CURRENT_DATE) THEN e.amount ELSE 0 END) - SUM(CASE WHEN DATE_TRUNC('month', e.earned_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN e.amount ELSE 0 END)) / SUM(CASE WHEN DATE_TRUNC('month', e.earned_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN e.amount ELSE 0 END)) * 100
        ELSE 0
      END, 0
    ) as monthly_growth,
    0::numeric as pending_payouts,
    COALESCE(SUM(e.amount), 0) as available_balance
  FROM earnings e
  WHERE e.creator_id = get_earnings_overview.creator_id
  GROUP BY DATE_TRUNC('month', e.earned_at)
  ORDER BY DATE_TRUNC('month', e.earned_at) DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Recreate get_earnings_by_source with fixed column references
CREATE OR REPLACE FUNCTION get_earnings_by_source(creator_id uuid)
RETURNS TABLE (
  source_type text,
  amount numeric,
  percentage numeric
) AS $$
DECLARE
  total_amount numeric;
BEGIN
  -- Get total earnings
  SELECT COALESCE(SUM(e.amount), 0) INTO total_amount
  FROM earnings e
  WHERE e.creator_id = get_earnings_by_source.creator_id;

  -- Return earnings by source with percentages
  RETURN QUERY
  SELECT 
    e.source_type,
    SUM(e.amount) as amount,
    CASE 
      WHEN total_amount > 0 THEN (SUM(e.amount) / total_amount) * 100
      ELSE 0
    END as percentage
  FROM earnings e
  WHERE e.creator_id = get_earnings_by_source.creator_id
  GROUP BY e.source_type
  ORDER BY SUM(e.amount) DESC;
END;
$$ LANGUAGE plpgsql;

-- Recreate get_earnings_history with fixed column references
CREATE OR REPLACE FUNCTION get_earnings_history(
  creator_id uuid,
  page_size integer DEFAULT 10,
  page_number integer DEFAULT 1
)
RETURNS TABLE (
  id uuid,
  amount numeric,
  source_type text,
  earned_at timestamptz,
  source_details jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.amount,
    e.source_type,
    e.earned_at,
    CASE 
      WHEN e.source_type = 'book_sale' THEN 
        (SELECT jsonb_build_object('title', b.title, 'price', b.price) FROM books b WHERE b.id = e.source_id)
      WHEN e.source_type = 'audiobook_sale' THEN 
        (SELECT jsonb_build_object('title', ab.title, 'price', ab.price) FROM audiobooks ab WHERE ab.id = e.source_id)
      WHEN e.source_type = 'subscription' THEN 
        jsonb_build_object('title', 'Subscription Commission', 'price', e.amount / 0.3)
      ELSE 
        jsonb_build_object('title', 'Other', 'price', 0)
    END as source_details
  FROM earnings e
  WHERE e.creator_id = get_earnings_history.creator_id
  ORDER BY e.earned_at DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;