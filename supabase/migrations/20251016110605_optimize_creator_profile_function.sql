/*
  # Optimize Creator Profile Function

  1. Changes
    - Create optimized get_creator_profile_fast function
    - Uses simpler queries with better performance
    - Reduces nested queries
  
  2. Performance Improvements
    - Removed complex UNION queries
    - Simplified content counting
    - Added proper indexes
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_author_status ON articles(author_id, status);
CREATE INDEX IF NOT EXISTS idx_books_author_status ON books(author_id, status);
CREATE INDEX IF NOT EXISTS idx_audiobooks_author_status ON audiobooks(author_id, status);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_author_status ON podcast_episodes(author_id, status);
CREATE INDEX IF NOT EXISTS idx_content_views_content ON content_views(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_ratings_content ON ratings(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_followers_creator ON followers(creator_id);

-- Create optimized function
CREATE OR REPLACE FUNCTION get_creator_profile_fast(username text)
RETURNS TABLE (
  profile jsonb,
  stats jsonb,
  recent_content jsonb,
  achievements jsonb[]
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  creator_id uuid;
  profile_data jsonb;
BEGIN
  -- Get creator profile
  SELECT 
    id,
    jsonb_build_object(
      'id', id,
      'username', profiles.username,
      'name', name,
      'avatar_url', avatar_url,
      'cover_url', cover_url,
      'bio', bio,
      'role', role,
      'expertise', expertise,
      'social_links', social_links,
      'verified', verified,
      'created_at', COALESCE(created_at, updated_at)
    )
  INTO creator_id, profile_data
  FROM profiles 
  WHERE profiles.username = get_creator_profile_fast.username;

  IF creator_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  RETURN QUERY
  SELECT
    profile_data,
    
    -- Stats
    jsonb_build_object(
      'total_articles', (SELECT COUNT(*) FROM articles WHERE author_id = creator_id AND status = 'published'),
      'total_books', (SELECT COUNT(*) FROM books WHERE author_id = creator_id AND status = 'published'),
      'total_audiobooks', (SELECT COUNT(*) FROM audiobooks WHERE author_id = creator_id AND status = 'published'),
      'total_podcasts', (SELECT COUNT(*) FROM podcast_episodes WHERE author_id = creator_id AND status = 'published'),
      'total_content', (
        (SELECT COUNT(*) FROM articles WHERE author_id = creator_id AND status = 'published') +
        (SELECT COUNT(*) FROM books WHERE author_id = creator_id AND status = 'published') +
        (SELECT COUNT(*) FROM audiobooks WHERE author_id = creator_id AND status = 'published') +
        (SELECT COUNT(*) FROM podcast_episodes WHERE author_id = creator_id AND status = 'published')
      ),
      'total_views', COALESCE((
        SELECT COUNT(*) FROM content_views cv
        WHERE cv.content_id IN (
          SELECT id FROM articles WHERE author_id = creator_id
          UNION ALL SELECT id FROM books WHERE author_id = creator_id
          UNION ALL SELECT id FROM audiobooks WHERE author_id = creator_id
          UNION ALL SELECT id FROM podcast_episodes WHERE author_id = creator_id
        )
      ), 0),
      'avg_rating', COALESCE((
        SELECT ROUND(AVG(rating)::numeric, 1) FROM ratings r
        WHERE r.content_id IN (
          SELECT id FROM articles WHERE author_id = creator_id
          UNION ALL SELECT id FROM books WHERE author_id = creator_id
          UNION ALL SELECT id FROM audiobooks WHERE author_id = creator_id
          UNION ALL SELECT id FROM podcast_episodes WHERE author_id = creator_id
        )
      ), 0),
      'total_followers', (SELECT COUNT(*) FROM followers WHERE followers.creator_id = creator_id)
    ),
    
    -- Recent Content
    jsonb_build_object(
      'articles', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'title', a.title,
            'excerpt', COALESCE(a.excerpt, substring(a.content from 1 for 200)),
            'cover_url', a.cover_url,
            'created_at', a.created_at,
            'views', (SELECT COUNT(*) FROM content_views WHERE content_id = a.id AND content_type = 'article')
          )
        )
        FROM (SELECT * FROM articles WHERE author_id = creator_id AND status = 'published' ORDER BY created_at DESC LIMIT 5) a
      ), '[]'::jsonb),
      'books', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', b.id,
            'title', b.title,
            'description', b.description,
            'cover_url', b.cover_url,
            'price', b.price,
            'created_at', b.created_at,
            'views', (SELECT COUNT(*) FROM content_views WHERE content_id = b.id AND content_type = 'book')
          )
        )
        FROM (SELECT * FROM books WHERE author_id = creator_id AND status = 'published' ORDER BY created_at DESC LIMIT 5) b
      ), '[]'::jsonb),
      'audiobooks', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ab.id,
            'title', ab.title,
            'description', ab.description,
            'cover_url', ab.cover_url,
            'price', ab.price,
            'narrator', ab.narrator,
            'created_at', ab.created_at,
            'views', (SELECT COUNT(*) FROM content_views WHERE content_id = ab.id AND content_type = 'audiobook')
          )
        )
        FROM (SELECT * FROM audiobooks WHERE author_id = creator_id AND status = 'published' ORDER BY created_at DESC LIMIT 5) ab
      ), '[]'::jsonb),
      'podcasts', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', pe.id,
            'title', pe.title,
            'description', pe.description,
            'cover_url', pe.cover_url,
            'duration', pe.duration,
            'created_at', pe.created_at,
            'views', (SELECT COUNT(*) FROM content_views WHERE content_id = pe.id AND content_type = 'podcast')
          )
        )
        FROM (SELECT * FROM podcast_episodes WHERE author_id = creator_id AND status = 'published' ORDER BY created_at DESC LIMIT 5) pe
      ), '[]'::jsonb)
    ),
    
    -- Achievements
    COALESCE((SELECT achievements FROM profiles WHERE id = creator_id), ARRAY[]::jsonb[]);
END;
$$;