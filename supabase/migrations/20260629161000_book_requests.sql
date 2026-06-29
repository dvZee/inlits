-- Create book_requests table
CREATE TABLE IF NOT EXISTS book_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_title TEXT NOT NULL,
  book_author TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;

-- Create insert and select policies for users
CREATE POLICY "Users can create their own book requests" 
  ON book_requests FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own book requests" 
  ON book_requests FOR SELECT 
  USING (auth.uid() = user_id);
