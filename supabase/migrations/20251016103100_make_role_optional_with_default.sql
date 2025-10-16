/*
  # Make Role Optional with Default User Value

  1. Changes
    - Set role to default to 'user' for all new profiles
    - Make role column have a default value so it's automatically populated
    - This ensures all users are treated as creators by default
    
  2. Notes
    - Existing users already have 'user' role from previous migration
    - New users will automatically get 'user' role
    - Role column is kept for backwards compatibility
*/

-- Ensure default role is set to 'user'
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user';

-- Update any profiles that might not have a role set
UPDATE profiles SET role = 'user' WHERE role IS NULL OR role = '';

-- Ensure the constraint allows 'user' role
DO $$
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  
  -- Add new constraint that includes 'user'
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'creator', 'consumer'));
END $$;