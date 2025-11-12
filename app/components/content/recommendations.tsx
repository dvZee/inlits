import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { ContentCarousel } from './content-carousel';
import type { ContentItem } from '@/lib/types';

interface RecommendationsProps {
  currentContent?: ContentItem;
}

export function Recommendations({ currentContent }: RecommendationsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        let categoryFilter: string[] = [];

        if (currentContent?.categories && currentContent.categories.length > 0) {
          categoryFilter = currentContent.categories;
        } else if (currentContent?.category) {
          categoryFilter = [currentContent.category];
        }

        if (user && categoryFilter.length === 0) {
          const { data: historyData } = await supabase
            .from('content_history')
            .select('content_type')
            .eq('user_id', user.id)
            .limit(10);

          if (historyData && historyData.length > 0) {
            const contentTypes = [...new Set(historyData.map(h => h.content_type))];
            categoryFilter = contentTypes;
          }
        }

        const [audiobooksResult, booksResult, podcastsResult] = await Promise.all([
          supabase
            .from('audiobooks')
            .select(`
              id,
              title,
              cover_url,
              category,
              categories,
              created_at,
              author:profiles!audiobooks_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(10),

          supabase
            .from('books')
            .select(`
              id,
              title,
              cover_url,
              category,
              created_at,
              author:profiles!books_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(10),

          supabase
            .from('podcast_episodes')
            .select(`
              id,
              title,
              cover_url,
              duration,
              category,
              categories,
              created_at,
              author:profiles!podcast_episodes_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(10)
        ]);

        const items: ContentItem[] = [];

        const processContent = (data: any[], type: ContentItem['type']) => {
          data?.forEach((item) => {
            const author = Array.isArray(item.author) ? item.author[0] : item.author;

            if (currentContent && item.id === currentContent.id) {
              return;
            }

            const itemCategories = item.categories || (item.category ? [item.category] : []);
            const matchesCategory = categoryFilter.length === 0 ||
              categoryFilter.some(cat => itemCategories.includes(cat));

            if (matchesCategory || categoryFilter.length === 0) {
              items.push({
                id: item.id,
                type,
                title: item.title,
                thumbnail: item.cover_url || 'https://placehold.co/600x800?text=Content',
                duration: type === 'podcast' ? item.duration : '2 hours',
                views: 0,
                createdAt: item.created_at,
                creator: author ? {
                  id: author.id,
                  name: author.name || 'Unknown',
                  avatar: author.avatar_url || 'https://placehold.co/80x80?text=U',
                  username: author.username || 'user',
                  followers: 0
                } : undefined,
                category: item.category || '',
                categories: itemCategories,
                featured: false,
                rating: 4.5
              });
            }
          });
        };

        processContent(audiobooksResult.data || [], 'audiobook');
        processContent(booksResult.data || [], 'ebook');
        processContent(podcastsResult.data || [], 'podcast');

        const shuffled = items.sort(() => Math.random() - 0.5);
        setRecommendations(shuffled.slice(0, 15));
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, currentContent]);

  if (loading || recommendations.length === 0) {
    return null;
  }

  return (
    <ContentCarousel
      title="Recommended for You"
      items={recommendations}
    />
  );
}
