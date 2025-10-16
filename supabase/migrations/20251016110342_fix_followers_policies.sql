/*
  # Fix Followers Table Policies

  1. Changes
    - Replace ALL policy with specific INSERT and DELETE policies
    - Ensure authenticated users can follow/unfollow properly
  
  2. Security
    - Users can only insert/delete their own follow records
    - Anyone can view followers (public data)
*/

-- Drop the existing ALL policy
DROP POLICY IF EXISTS "Authenticated users can follow/unfollow" ON followers;

-- Create specific INSERT policy
CREATE POLICY "Users can follow others"
  ON followers
  FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = auth.uid());

-- Create specific DELETE policy  
CREATE POLICY "Users can unfollow"
  ON followers
  FOR DELETE
  TO authenticated
  USING (follower_id = auth.uid());