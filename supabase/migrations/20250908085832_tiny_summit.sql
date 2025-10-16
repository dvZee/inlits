/*
  # Fix comments foreign key relationship

  1. Changes
    - Add proper foreign key constraint between comments.user_id and profiles.id
    - This will allow Supabase to resolve the relationship for joins

  2. Security
    - Maintains existing RLS policies
*/

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_user_id_fkey' 
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE comments 
    ADD CONSTRAINT comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;