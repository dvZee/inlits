/*
  # Fix Ambiguous Column Reference in Creator Profile Function

  1. Changes
    - Fix ambiguous column references by using table aliases
    - Properly qualify all column names
  
  2. Performance
    - Maintain all performance optimizations
    - Keep indexes in place
*/

-- Drop and recreate with fixed column references
DROP FUNCTION IF EXISTS get_creator_profile_fast(text);

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
    p.id,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'name', p.name,
      'avatar_url', p.avatar_url,
      'cover_url', p.cover_url,
      'bio', p.bio,
      'role', p.role,
      'expertise', p.expertise,
      'social_links', p.social_links,
      'verified', p.verified,
      'created_at', COALESCE(p.created_at, p.updated_at)
    )
  INTO creator_id, profile_data
  FROM profiles p
  WHERE p.username = get_creator_profile_fast.username;

  IF creator_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  RETURN QUERY
  SELECT
    profile_data,
    
    -- Stats
    jsonb_build_object(
      'total_articles', (SELECT COUNT(*) FROM articles a WHERE a.author_id = creator_id AND a.status = 'published'),
      'total_books', (SELECT COUNT(*) FROM books b WHERE b.author_id = creator_id AND b.status = 'published'),
      'total_audiobooks', (SELECT COUNT(*) FROM audiobooks ab WHERE ab.author_id = creator_id AND ab.status = 'published'),
      'total_podcasts', (SELECT COUNT(*) FROM podcast_episodes pe WHERE pe.author_id = creator_id AND pe.status = 'published'),
      'total_content', (
        (SELECT COUNT(*) FROM articles a WHERE a.author_id = creator_id AND a.status = 'published') +
        (SELECT COUNT(*) FROM books b WHERE b.author_id = creator_id AND b.status = 'published') +
        (SELECT COUNT(*) FROM audiobooks ab WHERE ab.author_id = creator_id AND ab.status = 'published') +
        (SELECT COUNT(*) FROM podcast_episodes pe WHERE pe.author_id = creator_id AND pe.status = 'published')
      ),
      'total_views', COALESCE((
        SELECT COUNT(*) FROM content_views cv
        WHERE cv.content_id IN (
          SELECT a.id FROM articles a WHERE a.author_id = creator_id
          UNION ALL SELECT b.id FROM books b WHERE b.author_id = creator_id
          UNION ALL SELECT ab.id FROM audiobooks ab WHERE ab.author_id = creator_id
          UNION ALL SELECT pe.id FROM podcast_episodes pe WHERE pe.author_id = creator_id
        )
      ), 0),
      'avg_rating', COALESCE((
        SELECT ROUND(AVG(r.rating)::numeric, 1) FROM ratings r
        WHERE r.content_id IN (
          SELECT a.id FROM articles a WHERE a.author_id = creator_id
          UNION ALL SELECT b.id FROM books b WHERE b.author_id = creator_id
          UNION ALL SELECT ab.id FROM audiobooks ab WHERE ab.author_id = creator_id
          UNION ALL SELECT pe.id FROM podcast_episodes pe WHERE pe.author_id = creator_id
        )
      ), 0),
      'total_followers', (SELECT COUNT(*) FROM followers f WHERE f.creator_id = creator_id)
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
            'views', (SELECT COUNT(*) FROM content_views cv WHERE cv.content_id = a.id AND cv.content_type = 'article')
          )
        )
        FROM (SELECT * FROM articles a WHERE a.author_id = creator_id AND a.status = 'published' ORDER BY a.created_at DESC LIMIT 5) a
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
            'views', (SELECT COUNT(*) FROM content_views cv WHERE cv.content_id = b.id AND cv.content_type = 'book')
          )
        )
        FROM (SELECT * FROM books b WHERE b.author_id = creator_id AND b.status = 'published' ORDER BY b.created_at DESC LIMIT 5) b
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
            'views', (SELECT COUNT(*) FROM content_views cv WHERE cv.content_id = ab.id AND cv.content_type = 'audiobook')
          )
        )
        FROM (SELECT * FROM audiobooks ab WHERE ab.author_id = creator_id AND ab.status = 'published' ORDER BY ab.created_at DESC LIMIT 5) ab
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
            'views', (SELECT COUNT(*) FROM content_views cv WHERE cv.content_id = pe.id AND cv.content_type = 'podcast')
          )
        )
        FROM (SELECT * FROM podcast_episodes pe WHERE pe.author_id = creator_id AND pe.status = 'published' ORDER BY pe.created_at DESC LIMIT 5) pe
      ), '[]'::jsonb)
    ),
    
    -- Achievements
    COALESCE((SELECT p.achievements FROM profiles p WHERE p.id = creator_id), ARRAY[]::jsonb[]);
END;
$$;