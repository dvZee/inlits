import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@remix-run/react';
import { supabase } from '@/lib/supabase';
import { Play, ChevronLeft, ChevronRight, Shuffle, Repeat } from 'lucide-react';
import { ImageLoader } from '@/components/image-loader';
import { useAudio } from '@/lib/audio-context';
import type { ContentItem } from '@/lib/types';

export function CollectionPlayerPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { playAudio } = useAudio();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  useEffect(() => {
    loadCollectionItems();
  }, [category]);

  const loadCollectionItems = async () => {
    if (!category) return;

    setLoading(true);
    try {
      const categoryName = category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const [audiobooksResult, booksResult, podcastsResult] = await Promise.all([
        supabase
          .from('audiobooks')
          .select(`
            id,
            title,
            description,
            cover_url,
            duration,
            audio_url,
            created_at,
            category,
            categories,
            author:profiles!audiobooks_author_id_fkey (
              id,
              name,
              avatar_url,
              username
            )
          `)
          .eq('status', 'published')
          .contains('categories', [categoryName])
          .order('created_at', { ascending: false }),

        supabase
          .from('books')
          .select(`
            id,
            title,
            description,
            cover_url,
            created_at,
            category,
            author:profiles!books_author_id_fkey (
              id,
              name,
              avatar_url,
              username
            )
          `)
          .eq('status', 'published')
          .eq('category', categoryName)
          .order('created_at', { ascending: false }),

        supabase
          .from('podcast_episodes')
          .select(`
            id,
            title,
            description,
            cover_url,
            duration,
            audio_url,
            created_at,
            category,
            categories,
            author:profiles!podcast_episodes_author_id_fkey (
              id,
              name,
              avatar_url,
              username
            )
          `)
          .eq('status', 'published')
          .contains('categories', [categoryName])
          .order('created_at', { ascending: false })
      ]);

      const normalizeAuthor = (author: any) => {
        const data = Array.isArray(author) ? author[0] : author;
        return {
          id: data?.id || '',
          name: data?.name || data?.username || 'Unknown Creator',
          avatar: data?.avatar_url || '',
          username: data?.username || 'creator'
        };
      };

      const audiobooks: ContentItem[] = (audiobooksResult.data || []).map(item => ({
        id: item.id,
        type: 'audiobook' as const,
        title: item.title,
        thumbnail: item.cover_url || '',
        duration: item.duration || '2 hours',
        views: 0,
        createdAt: item.created_at,
        creator: {
          ...normalizeAuthor(item.author),
          followers: 0
        },
        category: item.category || 'Audiobook',
        categories: item.categories || [],
        featured: false,
        rating: 4.5,
        bookmarked: false,
        likes_count: 0
      }));

      const books: ContentItem[] = (booksResult.data || []).map(item => ({
        id: item.id,
        type: 'ebook' as const,
        title: item.title,
        thumbnail: item.cover_url || '',
        duration: '4 hours',
        views: 0,
        createdAt: item.created_at,
        creator: {
          ...normalizeAuthor(item.author),
          followers: 0
        },
        category: item.category || 'Book',
        categories: [],
        featured: false,
        rating: 4.5,
        bookmarked: false,
        likes_count: 0
      }));

      const podcasts: ContentItem[] = (podcastsResult.data || []).map(item => ({
        id: item.id,
        type: 'podcast' as const,
        title: item.title,
        thumbnail: item.cover_url || '',
        duration: item.duration || '45 min',
        views: 0,
        createdAt: item.created_at,
        creator: {
          ...normalizeAuthor(item.author),
          followers: 0
        },
        category: item.category || 'Podcast',
        categories: item.categories || [],
        featured: false,
        rating: 4.5,
        bookmarked: false,
        likes_count: 0
      }));

      const allItems = [...audiobooks, ...podcasts, ...books];
      setItems(allItems);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const playItem = (index: number) => {
    const item = items[index];
    if (!item) return;

    setCurrentIndex(index);

    if (item.type === 'audiobook' || item.type === 'podcast') {
      playAudio({
        id: item.id,
        title: item.title,
        author: item.creator?.name || 'Unknown',
        authorId: item.creator?.id || '',
        authorUsername: item.creator?.username || 'creator',
        thumbnail: item.thumbnail,
        type: item.type
      });
    } else {
      navigate(`/reader/${item.type}-${item.id}`);
    }
  };

  const playNext = () => {
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * items.length);
      playItem(randomIndex);
    } else {
      const nextIndex = (currentIndex + 1) % items.length;
      playItem(nextIndex);
    }
  };

  const playPrevious = () => {
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    playItem(prevIndex);
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const toggleRepeat = () => {
    setRepeat(!repeat);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading collection...</p>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {currentItem && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="relative aspect-square max-w-md mx-auto w-full rounded-2xl overflow-hidden shadow-2xl">
              <ImageLoader
                src={currentItem.thumbnail}
                alt={currentItem.title}
                className="w-full h-full object-cover"
                loadingStrategy="eager"
              />
            </div>

            <div className="flex flex-col justify-center space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{currentItem.title}</h1>
                <p className="text-xl text-muted-foreground">
                  {currentItem.creator?.name || 'Unknown Creator'}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                  {currentItem.type}
                </span>
                <span>{currentItem.duration}</span>
                <span>
                  {currentIndex + 1} / {items.length}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleShuffle}
                  className={`p-3 rounded-full transition-colors ${
                    shuffle ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-primary/20'
                  }`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  onClick={playPrevious}
                  className="p-4 rounded-full bg-muted hover:bg-primary/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => playItem(currentIndex)}
                  className="p-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-110 shadow-lg"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </button>

                <button
                  onClick={playNext}
                  className="p-4 rounded-full bg-muted hover:bg-primary/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <button
                  onClick={toggleRepeat}
                  className={`p-3 rounded-full transition-colors ${
                    repeat ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-primary/20'
                  }`}
                >
                  <Repeat className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Collection Playlist</h2>
          <div className="space-y-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => playItem(index)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all ${
                  index === currentIndex
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-card hover:bg-muted border border-transparent'
                }`}
              >
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <ImageLoader
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.creator?.name || 'Unknown'} • {item.duration}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="px-2 py-1 bg-muted rounded-full text-xs">
                    {item.type}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
