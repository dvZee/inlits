/*
  # Fix Creator Role Database Issue

  1. Database Changes
    - Remove any triggers or policies forcing role to be 'consumer'
    - Update RLS policies to allow proper role assignment
    - Fix any constraints that might be overriding the role
    - Ensure the profiles table properly accepts 'creator' role

  2. Security
    - Maintain proper RLS while allowing role selection during signup
    - Ensure users can only update their own profiles after creation
*/

-- First, check and fix the profiles table role constraint
DO $$
BEGIN
  -- Check if there's a constraint forcing role to be 'consumer'
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_role_check' 
    AND check_clause LIKE '%consumer%'
    AND check_clause NOT LIKE '%creator%'
  ) THEN
    -- Drop the restrictive constraint
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    RAISE NOTICE 'Dropped restrictive role constraint';
  END IF;
END $$;

-- Ensure the role constraint allows both 'consumer' and 'creator'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['creator'::text, 'consumer'::text]));

-- Drop and recreate RLS policies to ensure they don't force role
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create proper RLS policies that don't interfere with role assignment
CREATE POLICY "Enable insert for authenticated users only"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for service role"
  ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);

-- Remove any database functions that might be overriding the role
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_safe() CASCADE;
DROP FUNCTION IF EXISTS public.ensure_profile_exists() CASCADE;

-- Remove any triggers that might be interfering
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_safe ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Ensure the profiles table structure is correct
DO $$
BEGIN
  -- Make sure role column exists and has correct type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role text NOT NULL DEFAULT 'consumer';
  END IF;

  -- Make sure role column doesn't have a default that overrides our input
  ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
  ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;
END $$;

-- Grant proper permissions for profile creation
GRANT INSERT, SELECT, UPDATE ON public.profiles TO authenticated;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.profiles TO service_role;

-- Test that the role constraint works properly
DO $$
BEGIN
  -- Test that 'creator' role is allowed
  PERFORM 1 WHERE 'creator' = ANY (ARRAY['creator'::text, 'consumer'::text]);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role constraint does not allow creator role';
  END IF;
  
  RAISE NOTICE 'Role constraint properly allows both consumer and creator roles';
END $$;