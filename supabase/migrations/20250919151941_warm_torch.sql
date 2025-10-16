/*
  # Add updated_at column to notifications table

  1. Changes
    - Add `updated_at` column to notifications table with timestamp type
    - Set default value to current timestamp
    - Add trigger to automatically update the timestamp when notifications are modified

  2. Security
    - No changes to existing RLS policies
*/

-- Add updated_at column to notifications table
ALTER TABLE notifications 
ADD COLUMN updated_at timestamptz DEFAULT now();

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();