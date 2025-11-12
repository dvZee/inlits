import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ImageLoader } from '../image-loader';

interface Collection {
  id: string;
  name: string;
  slug: string;
  count: number;
  thumbnails: string[];
}

export function PopularCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const categories = [
          'Business',
          'Psychology',
          'Self-Help',
          'Technology',
          'Philosophy',
          'Science',
          'History',
          'Health'
        ];

        const collectionsData = await Promise.all(
          categories.map(async (category) => {
            const [audiobooksResult, booksResult, podcastsResult] = await Promise.all([
              supabase
                .from('audiobooks')
                .select('id, cover_url')
                .eq('status', 'published')
                .contains('categories', [category])
                .limit(4),
              supabase
                .from('books')
                .select('id, cover_url')
                .eq('status', 'published')
                .eq('category', category)
                .limit(4),
              supabase
                .from('podcast_episodes')
                .select('id, cover_url')
                .eq('status', 'published')
                .contains('categories', [category])
                .limit(4)
            ]);

            const thumbnails: string[] = [];

            [audiobooksResult.data, booksResult.data, podcastsResult.data].forEach(items => {
              items?.forEach(item => {
                if (item.cover_url && thumbnails.length < 4) {
                  thumbnails.push(item.cover_url);
                }
              });
            });

            const totalCount =
              (audiobooksResult.data?.length || 0) +
              (booksResult.data?.length || 0) +
              (podcastsResult.data?.length || 0);

            return {
              id: category.toLowerCase(),
              name: category,
              slug: category.toLowerCase().replace(/\s+/g, '-'),
              count: totalCount,
              thumbnails: thumbnails.slice(0, 4)
            };
          })
        );

        setCollections(collectionsData.filter(c => c.count > 0));
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading || collections.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold">Popular Collections</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {collections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('category', collection.slug);
              window.history.pushState({}, '', url);
              window.location.reload();
            }}
            className="group relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 group-hover:to-black/20 transition-all" />

            <div className="relative">
              <div className="grid grid-cols-2 gap-1 mb-3 aspect-square">
                {collection.thumbnails.slice(0, 4).map((thumb, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-md overflow-hidden bg-muted"
                  >
                    <ImageLoader
                      src={thumb}
                      alt={`${collection.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {Array.from({ length: 4 - collection.thumbnails.length }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="rounded-md bg-muted/50"
                  />
                ))}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                  {collection.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {collection.count} items
                </p>
              </div>

              <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
