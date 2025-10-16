/*
  # Consolidate User Roles to Single "User" Role

  1. Changes
    - Drop existing role constraint
    - Add new constraint that accepts 'user', 'creator', and 'consumer'
    - Migrate all existing 'creator' and 'consumer' profiles to 'user' role
    - Set default role to 'user' for new profiles
    
  2. Security
    - No changes to RLS policies (all users now have same capabilities)
    
  3. Notes
    - This migration consolidates the creator and consumer roles
    - All users now have access to both creator and consumer features
    - Existing content and relationships are preserved
*/

-- Drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint that allows all three roles for transition period
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'creator', 'consumer'));

-- Update all existing users to 'user' role
UPDATE profiles SET role = 'user' WHERE role IN ('creator', 'consumer');

-- Update the default value to 'user'
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user';

-- Update any remaining null roles to 'user'
UPDATE profiles SET role = 'user' WHERE role IS NULL;