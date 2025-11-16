-- Check for missing cover URLs in audiobooks
SELECT 
  id,
  title,
  cover_url,
  CASE 
    WHEN cover_url IS NULL THEN 'NULL'
    WHEN cover_url = '' THEN 'EMPTY STRING'
    WHEN cover_url LIKE '%placehold%' THEN 'PLACEHOLDER'
    ELSE 'HAS URL'
  END as cover_status,
  created_at
FROM audiobooks 
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20;

-- Check for missing cover URLs in books
SELECT 
  id,
  title,
  cover_url,
  CASE 
    WHEN cover_url IS NULL THEN 'NULL'
    WHEN cover_url = '' THEN 'EMPTY STRING'
    WHEN cover_url LIKE '%placehold%' THEN 'PLACEHOLDER'
    ELSE 'HAS URL'
  END as cover_status,
  created_at
FROM books
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20;

-- Check for missing cover URLs in podcasts
SELECT 
  id,
  title,
  cover_url,
  CASE 
    WHEN cover_url IS NULL THEN 'NULL'
    WHEN cover_url = '' THEN 'EMPTY STRING'
    WHEN cover_url LIKE '%placehold%' THEN 'PLACEHOLDER'
    ELSE 'HAS URL'
  END as cover_status,
  created_at
FROM podcast_episodes
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20;

-- Summary counts
SELECT 
  'audiobooks' as table_name,
  COUNT(*) as total,
  COUNT(cover_url) as has_cover_url,
  COUNT(*) - COUNT(cover_url) as missing_cover_url
FROM audiobooks 
WHERE status = 'published'

UNION ALL

SELECT 
  'books' as table_name,
  COUNT(*) as total,
  COUNT(cover_url) as has_cover_url,
  COUNT(*) - COUNT(cover_url) as missing_cover_url
FROM books
WHERE status = 'published'

UNION ALL

SELECT 
  'podcast_episodes' as table_name,
  COUNT(*) as total,
  COUNT(cover_url) as has_cover_url,
  COUNT(*) - COUNT(cover_url) as missing_cover_url
FROM podcast_episodes
WHERE status = 'published';
