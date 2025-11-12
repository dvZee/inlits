import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { ContentCarousel } from './content-carousel';
import type { ContentItem } from '@/lib/types';

export function ContinueContent() {
  const { user } = useAuth();
  const [continueItems, setContinueItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchContinueContent = async () => {
      try {
        const { data: historyData, error } = await supabase
          .from('content_history')
          .select(`
            content_id,
            content_type,
            progress,
            last_accessed,
            audiobooks:audiobooks!content_history_content_id_fkey (
              id,
              title,
              cover_url,
              category,
              author:profiles!audiobooks_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            ),
            books:books!content_history_content_id_fkey (
              id,
              title,
              cover_url,
              category,
              author:profiles!books_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            ),
            podcasts:podcast_episodes!content_history_content_id_fkey (
              id,
              title,
              cover_url,
              duration,
              category,
              author:profiles!podcast_episodes_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            )
          `)
          .eq('user_id', user.id)
          .gt('progress', 0)
          .lt('progress', 95)
          .order('last_accessed', { ascending: false })
          .limit(10);

        if (error) throw error;

        const items: ContentItem[] = [];
        historyData?.forEach((item) => {
          let content = null;
          let type: ContentItem['type'] = 'audiobook';

          if (item.content_type === 'audiobook' && item.audiobooks) {
            content = Array.isArray(item.audiobooks) ? item.audiobooks[0] : item.audiobooks;
            type = 'audiobook';
          } else if (item.content_type === 'book' && item.books) {
            content = Array.isArray(item.books) ? item.books[0] : item.books;
            type = 'ebook';
          } else if (item.content_type === 'podcast' && item.podcasts) {
            content = Array.isArray(item.podcasts) ? item.podcasts[0] : item.podcasts;
            type = 'podcast';
          }

          if (content) {
            const author = Array.isArray(content.author) ? content.author[0] : content.author;
            items.push({
              id: content.id,
              type,
              title: content.title,
              thumbnail: content.cover_url || 'https://placehold.co/600x800?text=Content',
              duration: type === 'podcast' ? content.duration : '2 hours',
              views: 0,
              createdAt: item.last_accessed || new Date().toISOString(),
              creator: author ? {
                id: author.id,
                name: author.name || 'Unknown',
                avatar: author.avatar_url || 'https://placehold.co/80x80?text=U',
                username: author.username || 'user',
                followers: 0
              } : undefined,
              category: content.category || '',
              categories: [],
              featured: false,
              rating: 4.5,
              progress: item.progress
            });
          }
        });

        setContinueItems(items);
      } catch (error) {
        console.error('Error fetching continue content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContinueContent();
  }, [user]);

  if (loading || !user || continueItems.length === 0) {
    return null;
  }

  return (
    <ContentCarousel
      title="Continue Watching"
      items={continueItems}
    />
  );
}
