/*
  # Fix Profile Role Constraint and Creation

  1. Security
    - Fix role constraint to properly allow 'creator' and 'consumer'
    - Update RLS policies to be more permissive during signup
    - Remove any conflicting triggers

  2. Profile Creation
    - Ensure profiles can be created with any valid role
    - Fix any database-side issues preventing creator role assignment
*/

-- Drop existing role constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add proper role constraint that allows both roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['creator'::text, 'consumer'::text]));

-- Remove any default value from role column
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- Make role column NOT NULL
ALTER TABLE profiles ALTER COLUMN role SET NOT NULL;

-- Update RLS policies to be more permissive during signup
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;

-- Create a more permissive insert policy
CREATE POLICY "Enable profile creation for authenticated users" ON profiles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    -- Allow users to create their own profile
    auth.uid() = id
  );

-- Create a service role policy for system operations
CREATE POLICY "Enable profile creation for service role" ON profiles
  FOR INSERT 
  TO service_role 
  WITH CHECK (true);

-- Ensure the profiles table has proper permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Remove any problematic triggers that might interfere
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_safe();

-- Create a simple, safe trigger function that won't fail user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_minimal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only create profile if it doesn't exist
  -- Use INSERT ... ON CONFLICT DO NOTHING to avoid errors
  INSERT INTO public.profiles (id, username, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || EXTRACT(epoch FROM NOW())::text),
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger (but make it optional)
CREATE TRIGGER handle_new_user_minimal
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_minimal();

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user_minimal() TO service_role;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';