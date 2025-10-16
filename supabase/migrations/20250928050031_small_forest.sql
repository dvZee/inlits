/*
  # Optimize RLS Policies for Performance

  1. Performance Improvements
    - Replace auth.uid() with (select auth.uid()) in all RLS policies
    - This prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale

  2. Tables Updated
    - notifications
    - articles  
    - books
    - book_chapters
    - audiobooks
    - audiobook_chapters
    - podcast_episodes
    - series
    - content_views
    - followers
    - earnings
    - ratings
    - comments
    - book_clubs
    - book_club_members
    - book_club_discussions
    - book_club_discussion_replies
    - custom_shelves
    - shelf_items
    - bookmarks
    - learning_goals
    - security_logs
    - reading_status
    - profiles

  3. Security
    - All existing security rules maintained
    - Only performance optimization applied
*/

-- Drop and recreate policies for notifications table
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO public
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO public
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate policies for articles table
DROP POLICY IF EXISTS "Creators can insert their own articles" ON articles;
DROP POLICY IF EXISTS "Creators can delete their own articles" ON articles;
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Creators can update their own articles" ON articles;

CREATE POLICY "Creators can insert their own articles"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Creators can delete their own articles"
  ON articles
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = author_id);

CREATE POLICY "Published articles are viewable by everyone"
  ON articles
  FOR SELECT
  TO public
  USING ((status = 'published'::text) OR ((select auth.uid()) = author_id));

CREATE POLICY "Creators can update their own articles"
  ON articles
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = author_id) AND (NOT (EXISTS ( SELECT 1
     FROM security_logs
    WHERE ((security_logs.user_id = (select auth.uid())) AND (security_logs.event = 'suspicious_activity'::text) AND (security_logs."timestamp" > (now() - '24:00:00'::interval)))))))
  WITH CHECK (true);

-- Drop and recreate policies for books table
DROP POLICY IF EXISTS "Creators can insert their own books" ON books;
DROP POLICY IF EXISTS "Creators can delete their own books" ON books;
DROP POLICY IF EXISTS "Published books are viewable by everyone" ON books;
DROP POLICY IF EXISTS "Creators can update their own books" ON books;

CREATE POLICY "Creators can insert their own books"
  ON books
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Creators can delete their own books"
  ON books
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = author_id);

CREATE POLICY "Published books are viewable by everyone"
  ON books
  FOR SELECT
  TO public
  USING ((status = 'published'::text) OR ((select auth.uid()) = author_id));

CREATE POLICY "Creators can update their own books"
  ON books
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = author_id) AND (NOT (EXISTS ( SELECT 1
     FROM security_logs
    WHERE ((security_logs.user_id = (select auth.uid())) AND (security_logs.event = 'suspicious_activity'::text) AND (security_logs."timestamp" > (now() - '24:00:00'::interval)))))))
  WITH CHECK (true);

-- Drop and recreate policies for book_chapters table
DROP POLICY IF EXISTS "Creators can manage chapters of their own books" ON book_chapters;
DROP POLICY IF EXISTS "Users can view chapters of published books" ON book_chapters;

CREATE POLICY "Creators can manage chapters of their own books"
  ON book_chapters
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
     FROM books
    WHERE ((books.id = book_chapters.book_id) AND (books.author_id = (select auth.uid()))))));

CREATE POLICY "Users can view chapters of published books"
  ON book_chapters
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
     FROM books
    WHERE ((books.id = book_chapters.book_id) AND ((books.status = 'published'::text) OR (books.author_id = (select auth.uid())))))));

-- Drop and recreate policies for audiobooks table
DROP POLICY IF EXISTS "Creators can insert their own audiobooks" ON audiobooks;
DROP POLICY IF EXISTS "Creators can delete their own audiobooks" ON audiobooks;
DROP POLICY IF EXISTS "Published audiobooks are viewable by everyone" ON audiobooks;
DROP POLICY IF EXISTS "Creators can update their own audiobooks" ON audiobooks;

CREATE POLICY "Creators can insert their own audiobooks"
  ON audiobooks
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Creators can delete their own audiobooks"
  ON audiobooks
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = author_id);

CREATE POLICY "Published audiobooks are viewable by everyone"
  ON audiobooks
  FOR SELECT
  TO public
  USING ((status = 'published'::text) OR ((select auth.uid()) = author_id));

CREATE POLICY "Creators can update their own audiobooks"
  ON audiobooks
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = author_id) AND (NOT (EXISTS ( SELECT 1
     FROM security_logs
    WHERE ((security_logs.user_id = (select auth.uid())) AND (security_logs.event = 'suspicious_activity'::text) AND (security_logs."timestamp" > (now() - '24:00:00'::interval)))))))
  WITH CHECK (true);

-- Drop and recreate policies for audiobook_chapters table
DROP POLICY IF EXISTS "Creators can manage chapters of their own audiobooks" ON audiobook_chapters;
DROP POLICY IF EXISTS "Users can view chapters of published audiobooks" ON audiobook_chapters;

CREATE POLICY "Creators can manage chapters of their own audiobooks"
  ON audiobook_chapters
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
     FROM audiobooks
    WHERE ((audiobooks.id = audiobook_chapters.audiobook_id) AND (audiobooks.author_id = (select auth.uid()))))));

CREATE POLICY "Users can view chapters of published audiobooks"
  ON audiobook_chapters
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
     FROM audiobooks
    WHERE ((audiobooks.id = audiobook_chapters.audiobook_id) AND ((audiobooks.status = 'published'::text) OR (audiobooks.author_id = (select auth.uid())))))));

-- Drop and recreate policies for podcast_episodes table
DROP POLICY IF EXISTS "Creators can insert their own episodes" ON podcast_episodes;
DROP POLICY IF EXISTS "Creators can delete their own episodes" ON podcast_episodes;
DROP POLICY IF EXISTS "Published episodes are viewable by everyone" ON podcast_episodes;
DROP POLICY IF EXISTS "Creators can update their own episodes" ON podcast_episodes;

CREATE POLICY "Creators can insert their own episodes"
  ON podcast_episodes
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Creators can delete their own episodes"
  ON podcast_episodes
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = author_id);

CREATE POLICY "Published episodes are viewable by everyone"
  ON podcast_episodes
  FOR SELECT
  TO public
  USING ((status = 'published'::text) OR ((select auth.uid()) = author_id));

CREATE POLICY "Creators can update their own episodes"
  ON podcast_episodes
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = author_id) AND (NOT (EXISTS ( SELECT 1
     FROM security_logs
    WHERE ((security_logs.user_id = (select auth.uid())) AND (security_logs.event = 'suspicious_activity'::text) AND (security_logs."timestamp" > (now() - '24:00:00'::interval)))))))
  WITH CHECK (true);

-- Drop and recreate policies for series table
DROP POLICY IF EXISTS "Creators can insert their own series" ON series;
DROP POLICY IF EXISTS "Creators can update their own series" ON series;
DROP POLICY IF EXISTS "Creators can delete their own series" ON series;

CREATE POLICY "Creators can insert their own series"
  ON series
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Creators can update their own series"
  ON series
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = author_id)
  WITH CHECK (true);

CREATE POLICY "Creators can delete their own series"
  ON series
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = author_id);

-- Drop and recreate policies for content_views table
DROP POLICY IF EXISTS "Creators can view their content views" ON content_views;

CREATE POLICY "Creators can view their content views"
  ON content_views
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
     FROM articles
    WHERE ((articles.id = content_views.content_id) AND (articles.author_id = (select auth.uid())))
  UNION
   SELECT 1
     FROM books
    WHERE ((books.id = content_views.content_id) AND (books.author_id = (select auth.uid())))
  UNION
   SELECT 1
     FROM audiobooks
    WHERE ((audiobooks.id = content_views.content_id) AND (audiobooks.author_id = (select auth.uid())))
  UNION
   SELECT 1
     FROM podcast_episodes
    WHERE ((podcast_episodes.id = content_views.content_id) AND (podcast_episodes.author_id = (select auth.uid()))))));

-- Drop and recreate policies for followers table
DROP POLICY IF EXISTS "Authenticated users can follow/unfollow" ON followers;

CREATE POLICY "Authenticated users can follow/unfollow"
  ON followers
  FOR ALL
  TO authenticated
  USING (follower_id = (select auth.uid()))
  WITH CHECK (follower_id = (select auth.uid()));

-- Drop and recreate policies for earnings table
DROP POLICY IF EXISTS "Creators can view their earnings" ON earnings;

CREATE POLICY "Creators can view their earnings"
  ON earnings
  FOR SELECT
  TO public
  USING (creator_id = (select auth.uid()));

-- Drop and recreate policies for ratings table
DROP POLICY IF EXISTS "Users can manage their own ratings" ON ratings;

CREATE POLICY "Users can manage their own ratings"
  ON ratings
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate policies for comments table
DROP POLICY IF EXISTS "Users can manage their own comments" ON comments;

CREATE POLICY "Users can manage their own comments"
  ON comments
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate policies for book_clubs table
DROP POLICY IF EXISTS "Authenticated users can create book clubs" ON book_clubs;
DROP POLICY IF EXISTS "Creators can update their book clubs" ON book_clubs;

CREATE POLICY "Authenticated users can create book clubs"
  ON book_clubs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = creator_id);

CREATE POLICY "Creators can update their book clubs"
  ON book_clubs
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = creator_id)
  WITH CHECK ((select auth.uid()) = creator_id);

-- Drop and recreate policies for book_club_members table
DROP POLICY IF EXISTS "Users can join book clubs" ON book_club_members;
DROP POLICY IF EXISTS "Members can leave book clubs" ON book_club_members;

CREATE POLICY "Users can join book clubs"
  ON book_club_members
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id) AND (( SELECT count(*) AS count
     FROM book_club_members book_club_members_1
    WHERE (book_club_members_1.club_id = book_club_members_1.club_id)) < ( SELECT book_clubs.max_members
     FROM book_clubs
    WHERE (book_clubs.id = book_club_members.club_id))));

CREATE POLICY "Members can leave book clubs"
  ON book_club_members
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for book_club_discussions table
DROP POLICY IF EXISTS "Club members can create discussions" ON book_club_discussions;
DROP POLICY IF EXISTS "Discussion creators can update their discussions" ON book_club_discussions;

CREATE POLICY "Club members can create discussions"
  ON book_club_discussions
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
     FROM book_club_members
    WHERE ((book_club_members.club_id = book_club_discussions.club_id) AND (book_club_members.user_id = (select auth.uid()))))));

CREATE POLICY "Discussion creators can update their discussions"
  ON book_club_discussions
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = creator_id)
  WITH CHECK ((select auth.uid()) = creator_id);

-- Drop and recreate policies for book_club_discussion_replies table
DROP POLICY IF EXISTS "Club members can create replies" ON book_club_discussion_replies;
DROP POLICY IF EXISTS "Reply creators can update their replies" ON book_club_discussion_replies;

CREATE POLICY "Club members can create replies"
  ON book_club_discussion_replies
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
     FROM (book_club_discussions d
       JOIN book_club_members m ON ((m.club_id = d.club_id)))
    WHERE ((d.id = book_club_discussion_replies.discussion_id) AND (m.user_id = (select auth.uid()))))));

CREATE POLICY "Reply creators can update their replies"
  ON book_club_discussion_replies
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate policies for custom_shelves table
DROP POLICY IF EXISTS "Users can manage their own shelves" ON custom_shelves;

CREATE POLICY "Users can manage their own shelves"
  ON custom_shelves
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate policies for shelf_items table
DROP POLICY IF EXISTS "Users can manage items in their own shelves" ON shelf_items;

CREATE POLICY "Users can manage items in their own shelves"
  ON shelf_items
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
     FROM custom_shelves
    WHERE ((custom_shelves.id = shelf_items.shelf_id) AND (custom_shelves.user_id = (select auth.uid()))))))
  WITH CHECK ((EXISTS ( SELECT 1
     FROM custom_shelves
    WHERE ((custom_shelves.id = shelf_items.shelf_id) AND (custom_shelves.user_id = (select auth.uid()))))));

-- Drop and recreate policies for bookmarks table
DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON bookmarks;

CREATE POLICY "Users can manage their own bookmarks"
  ON bookmarks
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate policies for learning_goals table
DROP POLICY IF EXISTS "Users can manage their own learning goals" ON learning_goals;

CREATE POLICY "Users can manage their own learning goals"
  ON learning_goals
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate policies for security_logs table
DROP POLICY IF EXISTS "Only admins can view security logs" ON security_logs;

CREATE POLICY "Only admins can view security logs"
  ON security_logs
  FOR SELECT
  TO public
  USING (((select auth.uid()) IN ( SELECT profiles.id
     FROM profiles
    WHERE (profiles.role = 'admin'::text))));

-- Drop and recreate policies for reading_status table
DROP POLICY IF EXISTS "Users can update their own reading status" ON reading_status;
DROP POLICY IF EXISTS "Users can delete their own reading status" ON reading_status;
DROP POLICY IF EXISTS "Users can insert their own reading status" ON reading_status;
DROP POLICY IF EXISTS "Users can view their own reading status" ON reading_status;

CREATE POLICY "Users can update their own reading status"
  ON reading_status
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own reading status"
  ON reading_status
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own reading status"
  ON reading_status
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own reading status"
  ON reading_status
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for profiles table
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation for authenticated users" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Enable profile creation for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Drop and recreate policies for messages table
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can mark their received messages as read" ON messages;

CREATE POLICY "Users can view their own messages"
  ON messages
  FOR SELECT
  TO public
  USING (((select auth.uid()) = sender_id) OR ((select auth.uid()) = recipient_id));

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = sender_id);

CREATE POLICY "Users can mark their received messages as read"
  ON messages
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = recipient_id)
  WITH CHECK ((select auth.uid()) = recipient_id);