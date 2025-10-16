/*
  # Remove all database triggers for user creation

  This migration removes all database triggers that might be interfering with user creation
  and ensures profile creation is handled entirely client-side.
*/

-- Remove any existing triggers on the profiles table that might be causing issues
DROP TRIGGER IF EXISTS send_welcome_email_trigger ON public.profiles;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON public.profiles;

-- Remove any functions that might be called by auth triggers
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_safe() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_welcome() CASCADE;

-- Ensure RLS policies are permissive for profile creation
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create simple, permissive RLS policies
CREATE POLICY "Anyone can create profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Make sure the profiles table allows NULL values for optional fields during creation
ALTER TABLE public.profiles ALTER COLUMN name DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN bio DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN avatar_url DROP NOT NULL;

-- Ensure username has a default if not provided
ALTER TABLE public.profiles ALTER COLUMN username SET DEFAULT 'user_' || extract(epoch from now())::text;

-- Grant necessary permissions
GRANT INSERT, SELECT, UPDATE ON public.profiles TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;