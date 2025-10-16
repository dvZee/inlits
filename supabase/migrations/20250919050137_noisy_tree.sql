/*
  # Fix ambiguous creator_id column references

  1. Database Functions
    - Fix `get_earnings_overview` function to properly qualify all creator_id references
    - Fix `get_earnings_by_source` function to properly qualify all creator_id references  
    - Fix `get_earnings_history` function to properly qualify all creator_id references
    
  2. Changes Made
    - Added proper table aliases (e) for earnings table
    - Qualified all creator_id references with table alias
    - Ensured parameter names don't conflict with column names
*/

-- Drop existing functions to recreate them with proper column qualification
DROP FUNCTION IF EXISTS get_earnings_overview(uuid, text);
DROP FUNCTION IF EXISTS get_earnings_by_source(uuid, text);
DROP FUNCTION IF EXISTS get_earnings_history(uuid, text, integer, integer);

-- Recreate get_earnings_overview with proper column qualification
CREATE OR REPLACE FUNCTION get_earnings_overview(
  p_creator_id uuid,
  p_period text DEFAULT 'month'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  period_start timestamp;
BEGIN
  -- Calculate period start based on period parameter
  CASE p_period
    WHEN 'week' THEN
      period_start := date_trunc('week', now());
    WHEN 'month' THEN
      period_start := date_trunc('month', now());
    WHEN 'year' THEN
      period_start := date_trunc('year', now());
    ELSE
      period_start := date_trunc('month', now());
  END CASE;

  SELECT json_build_object(
    'total_earnings', COALESCE(SUM(e.amount), 0),
    'period_earnings', COALESCE(SUM(CASE WHEN e.earned_at >= period_start THEN e.amount ELSE 0 END), 0),
    'total_sales', COUNT(e.id),
    'period_sales', COUNT(CASE WHEN e.earned_at >= period_start THEN e.id END)
  )
  INTO result
  FROM earnings e
  WHERE e.creator_id = p_creator_id;

  RETURN result;
END;
$$;

-- Recreate get_earnings_by_source with proper column qualification
CREATE OR REPLACE FUNCTION get_earnings_by_source(
  p_creator_id uuid,
  p_period text DEFAULT 'month'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  period_start timestamp;
BEGIN
  -- Calculate period start based on period parameter
  CASE p_period
    WHEN 'week' THEN
      period_start := date_trunc('week', now());
    WHEN 'month' THEN
      period_start := date_trunc('month', now());
    WHEN 'year' THEN
      period_start := date_trunc('year', now());
    ELSE
      period_start := date_trunc('month', now());
  END CASE;

  SELECT json_agg(
    json_build_object(
      'source_type', e.source_type,
      'amount', COALESCE(SUM(e.amount), 0),
      'count', COUNT(e.id)
    )
  )
  INTO result
  FROM earnings e
  WHERE e.creator_id = p_creator_id
    AND e.earned_at >= period_start
  GROUP BY e.source_type;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Recreate get_earnings_history with proper column qualification
CREATE OR REPLACE FUNCTION get_earnings_history(
  p_creator_id uuid,
  p_period text DEFAULT 'month',
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', e.id,
      'amount', e.amount,
      'source_type', e.source_type,
      'source_id', e.source_id,
      'earned_at', e.earned_at
    )
    ORDER BY e.earned_at DESC
  )
  INTO result
  FROM earnings e
  WHERE e.creator_id = p_creator_id
  LIMIT p_limit
  OFFSET p_offset;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_earnings_overview(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_earnings_by_source(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_earnings_history(uuid, text, integer, integer) TO authenticated;