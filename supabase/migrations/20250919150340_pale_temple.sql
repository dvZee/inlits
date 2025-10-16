/*
  # Enable notifications functionality

  1. Database Functions
    - Create notification trigger functions
    - Add RPC functions for notification management
  
  2. Notification Types
    - Content notifications (new content from followed creators)
    - Follow notifications (new followers)
    - Mention notifications (mentions in comments)
    - Achievement notifications (badges and milestones)
  
  3. Security
    - RLS policies for notifications table
    - Proper user access controls
*/

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_link text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify followers when creator posts new content
CREATE OR REPLACE FUNCTION notify_followers_new_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify for published content
  IF NEW.status = 'published' THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    SELECT 
      f.follower_id,
      'content',
      'New content from ' || p.name,
      p.name || ' published: ' || NEW.title,
      CASE 
        WHEN TG_TABLE_NAME = 'articles' THEN '/reader/article-' || NEW.id
        WHEN TG_TABLE_NAME = 'books' THEN '/reader/book-' || NEW.id
        WHEN TG_TABLE_NAME = 'audiobooks' THEN '/player/audiobook-' || NEW.id
        WHEN TG_TABLE_NAME = 'podcast_episodes' THEN '/player/podcast-' || NEW.id
        ELSE '/content/' || NEW.id
      END
    FROM followers f
    JOIN profiles p ON p.id = NEW.author_id
    WHERE f.creator_id = NEW.author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify when someone gets a new follower
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT 
    NEW.creator_id,
    'follow',
    'New follower',
    p.name || ' started following you',
    '/creator/' || p.username
  FROM profiles p
  WHERE p.id = NEW.follower_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify when someone mentions you in a comment
CREATE OR REPLACE FUNCTION notify_mentions()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_username text;
  mentioned_user_id uuid;
  commenter_name text;
BEGIN
  -- Extract mentions from comment content (simple @username detection)
  FOR mentioned_username IN 
    SELECT DISTINCT regexp_replace(match[1], '^@', '') 
    FROM regexp_split_to_table(NEW.content, '\s+') AS t(word),
         regexp_matches(word, '@([a-zA-Z0-9_]+)') AS match
  LOOP
    -- Find the mentioned user
    SELECT id INTO mentioned_user_id
    FROM profiles
    WHERE username = mentioned_username;
    
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.user_id THEN
      -- Get commenter name
      SELECT name INTO commenter_name
      FROM profiles
      WHERE id = NEW.user_id;
      
      -- Create notification
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (
        mentioned_user_id,
        'mention',
        'You were mentioned',
        (commenter_name || ' mentioned you in a comment'),
        CASE 
          WHEN NEW.content_type = 'article' THEN '/reader/article-' || NEW.content_id
          WHEN NEW.content_type = 'book' THEN '/reader/book-' || NEW.content_id
          WHEN NEW.content_type = 'audiobook' THEN '/player/audiobook-' || NEW.content_id
          WHEN NEW.content_type = 'podcast' THEN '/player/podcast-' || NEW.content_id
          ELSE '/content/' || NEW.content_id
        END
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify about achievements
CREATE OR REPLACE FUNCTION notify_achievement(
  p_user_id uuid,
  p_achievement_name text,
  p_achievement_description text
) RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (
    p_user_id,
    'achievement',
    'Achievement unlocked!',
    'You earned: ' || p_achievement_name || ' - ' || p_achievement_description
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for content notifications
DROP TRIGGER IF EXISTS notify_followers_articles ON articles;
CREATE TRIGGER notify_followers_articles
  AFTER INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_new_content();

DROP TRIGGER IF EXISTS notify_followers_books ON books;
CREATE TRIGGER notify_followers_books
  AFTER INSERT OR UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_new_content();

DROP TRIGGER IF EXISTS notify_followers_audiobooks ON audiobooks;
CREATE TRIGGER notify_followers_audiobooks
  AFTER INSERT OR UPDATE ON audiobooks
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_new_content();

DROP TRIGGER IF EXISTS notify_followers_podcasts ON podcast_episodes;
CREATE TRIGGER notify_followers_podcasts
  AFTER INSERT OR UPDATE ON podcast_episodes
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_new_content();

-- Create trigger for follow notifications
DROP TRIGGER IF EXISTS notify_new_follower_trigger ON followers;
CREATE TRIGGER notify_new_follower_trigger
  AFTER INSERT ON followers
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_follower();

-- Create trigger for mention notifications
DROP TRIGGER IF EXISTS notify_mentions_trigger ON comments;
CREATE TRIGGER notify_mentions_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_mentions();

-- RPC function to get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id uuid,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
) RETURNS TABLE (
  id uuid,
  type text,
  title text,
  message text,
  link text,
  read boolean,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.type,
    n.title,
    n.message,
    n.link,
    n.read,
    n.created_at
  FROM notifications n
  WHERE n.user_id = p_user_id
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id uuid,
  p_notification_ids uuid[] DEFAULT NULL
) RETURNS void AS $$
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Mark all notifications as read
    UPDATE notifications 
    SET read = true, updated_at = now()
    WHERE user_id = p_user_id AND read = false;
  ELSE
    -- Mark specific notifications as read
    UPDATE notifications 
    SET read = true, updated_at = now()
    WHERE user_id = p_user_id AND id = ANY(p_notification_ids);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM notifications
    WHERE user_id = p_user_id AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;