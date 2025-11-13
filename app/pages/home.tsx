import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ContentLayout } from '@/components/content/content-layout';
import { HeroBanner } from '@/components/content/hero-banner';
import { ContinueContent } from '@/components/content/continue-content';
import { ContentCarousel } from '@/components/content/content-carousel';
import { ContentCard } from '@/components/content/content-card';
import { SmartRecommendations } from '@/components/content/smart-recommendations';
import { CinematicCollections } from '@/components/content/cinematic-collections';
import { HeroBannerSkeleton, ContentRowSkeleton } from '@/components/content/skeleton-loader';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { AddToShelfBanner } from '@/components/library/add-to-shelf-banner';
import type { ContentItem } from '@/lib/types';

interface HomeProps {
  selectedCategory?: string;
  initialData?: {
    audiobooks: any[];
    books: any[];
    podcasts: any[];
    articles: any[];
  };
}

// Cache for content data
const contentCache = new Map<string, {
  data: {
    audiobooks: ContentItem[];
    ebooks: ContentItem[];
    articles: ContentItem[];
    podcasts: ContentItem[];
  };
  timestamp: number;
}>();

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes - increased cache duration

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const isBrowser = typeof window !== 'undefined';

const safeStorage: StorageLike = isBrowser && typeof window.localStorage !== 'undefined'
  ? window.localStorage
  : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    };

const LOCAL_STORAGE_KEY = 'inlits:home-content';

const getPlaceholderThumbnail = (type: 'audiobook' | 'ebook' | 'podcast') => {
  switch (type) {
    case 'audiobook':
      return 'https://placehold.co/600x800?text=Audiobook';
    case 'podcast':
      return 'https://placehold.co/600x600?text=Podcast';
    case 'ebook':
    default:
      return 'https://placehold.co/600x900?text=Book';
  }
};

const getPlaceholderAvatar = (initial: string) =>
  `https://placehold.co/80x80?text=${encodeURIComponent(initial || 'U')}`;

export function Home({ selectedCategory = 'all', initialData }: HomeProps) {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [allContent, setAllContent] = useState<{
    audiobooks: ContentItem[];
    ebooks: ContentItem[];
    articles: ContentItem[];
    podcasts: ContentItem[];
  }>(() => {
    if (initialData) {
      return {
        audiobooks: initialData.audiobooks || [],
        ebooks: initialData.books || [],
        articles: initialData.articles || [],
        podcasts: initialData.podcasts || []
      };
    }
    return {
      audiobooks: [],
      ebooks: [],
      articles: [],
      podcasts: []
    };
  });
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(!!initialData);

  // Get shelf parameter from URL
  const shelfParam = searchParams.get('shelf');
  const [activeShelf, setActiveShelf] = useState<string | null>(shelfParam);
  const [shelfName, setShelfName] = useState<string>('');

  // Attempt to hydrate from local storage immediately for faster first paint
  useEffect(() => {
    if (!isBrowser) return;

    try {
      const cached = safeStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as {
          data: typeof allContent;
          timestamp: number;
        };

        const isFresh = Date.now() - parsed.timestamp < CACHE_DURATION;
        setAllContent(parsed.data);
        setLoading(false);
        setInitialLoadComplete(true);
        contentCache.set('all-content', {
          data: parsed.data,
          timestamp: parsed.timestamp
        });
        if (!isFresh) {
          console.info('Home content cache is stale; refreshing data...');
        }
      }
    } catch (error) {
      console.warn('Failed to restore home content cache:', error);
    }
  }, []);

  // Get shelf name based on the parameter
  useEffect(() => {
    if (!shelfParam) {
      setActiveShelf(null);
      return;
    }

    setActiveShelf(shelfParam);

    if (shelfParam === 'savedForLater') {
      setShelfName('Saved for Later');
    } else if (shelfParam === 'learningGoals') {
      setShelfName('2025 Learning Goals');
    } else {
      const fetchShelfName = async () => {
        try {
          const { data, error } = await supabase
            .from('custom_shelves')
            .select('name')
            .eq('id', shelfParam)
            .single();

          if (error) throw error;
          if (data) {
            setShelfName(data.name);
          }
        } catch (err) {
          console.error('Error fetching shelf name:', err);
          setShelfName('Custom Shelf');
        }
      };

      fetchShelfName();
    }
  }, [shelfParam]);

  // Load content once mounted and refresh cache on user changes
  useEffect(() => {
    // Skip client-side fetch if we have SSR data
    if (initialData && initialLoadComplete) {
      return;
    }

    let isMounted = true;

    const loadAllContent = async () => {
      try {
        if (!initialLoadComplete) {
          setLoading(true);
        }
        setError(null);

        // Load all content types in parallel with limits for better performance
        const [audiobooksResult, booksResult, podcastsResult] = await Promise.all([
          supabase
            .from('audiobooks')
            .select(`
              id,
              title,
              description,
              cover_url,
              created_at,
              featured,
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
            .order('featured', { ascending: false })
            .order('created_at', { ascending: false }),

          supabase
            .from('books')
            .select(`
              id,
              title,
              description,
              cover_url,
              created_at,
              featured,
              category,
              author:profiles!books_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `)
            .eq('status', 'published')
            .order('featured', { ascending: false })
            .order('created_at', { ascending: false }),

          supabase
            .from('podcast_episodes')
            .select(`
              id,
              title,
              description,
              cover_url,
              duration,
              created_at,
              featured,
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
            .order('featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(20)
        ]);

        // Check for errors - log to console but continue with partial data
        if (audiobooksResult.error) {
          console.error('Audiobooks error:', audiobooksResult.error);
        }
        if (booksResult.error) {
          console.error('Books error:', booksResult.error);
        }
        if (podcastsResult.error) {
          console.error('Podcasts error:', podcastsResult.error);
        }

        // If all queries failed, throw an error
        if (audiobooksResult.error && booksResult.error && podcastsResult.error) {
          throw new Error('Unable to load content. Please check your connection and try again.');
        }

        console.log('Raw data loaded:', {
          audiobooks: audiobooksResult.data?.length || 0,
          books: booksResult.data?.length || 0,
          podcasts: podcastsResult.data?.length || 0
        });

        // Get user bookmarks if logged in
        let userBookmarks: { content_id: string; content_type: string }[] = [];
        if (user) {
          const { data: bookmarksData } = await supabase
            .from('bookmarks')
            .select('content_id, content_type')
            .eq('user_id', user.id);
          
          userBookmarks = bookmarksData || [];
        }

        // Get real view counts from database
        const getViewCount = async (contentId: string, contentType: string) => {
          const { count } = await supabase
            .from('content_views')
            .select('*', { count: 'exact', head: true })
            .eq('content_id', contentId)
            .eq('content_type', contentType);
          return count || 0;
        };

        // Get real like counts from database
        const getLikeCount = async (contentId: string, contentType: string) => {
          const { data } = await supabase
            .from('ratings')
            .select('rating')
            .eq('content_id', contentId)
            .eq('content_type', contentType)
            .eq('rating', 5);
          return data?.length || 0;
        };
        const isBookmarked = (id: string, type: string) => {
          return userBookmarks.some(b => b.content_id === id && b.content_type === type);
        };

        const normalizeAuthor = (author: unknown, fallbackId: string) => {
          const data = Array.isArray(author) ? author[0] : author;
          const name =
            typeof data?.name === 'string'
              ? data.name
              : typeof data?.username === 'string'
                ? data.username
                : 'Unknown Creator';
          const initial = name[0]?.toUpperCase() || 'U';
          return {
            id: typeof data?.id === 'string' ? data.id : fallbackId,
            name,
            avatar:
              typeof data?.avatar_url === 'string' && data.avatar_url.trim().length > 0
                ? data.avatar_url
                : getPlaceholderAvatar(initial),
            username: typeof data?.username === 'string' && data.username.length > 0 ? data.username : 'creator'
          };
        };

        const resolveCategories = (item: unknown): string[] => {
          if (item && typeof item === 'object' && 'categories' in item) {
            const candidate = (item as { categories?: string[] }).categories;
            if (Array.isArray(candidate)) {
              return candidate.filter((value): value is string => typeof value === 'string');
            }
          }

          if (item && typeof item === 'object' && 'category' in item) {
            const value = (item as { category?: string }).category;
            if (typeof value === 'string' && value.length > 0) {
              return [value];
            }
          }

          return [];
        };

        // Transform data to ContentItem format
        const audiobooks = await Promise.all((audiobooksResult.data || []).map(async item => ({
          id: item.id,
          type: 'audiobook' as const,
          title: item.title,
          thumbnail:
            item.cover_url && item.cover_url.trim().length > 0
              ? item.cover_url
              : getPlaceholderThumbnail('audiobook'),
          duration: '2 hours',
          views: await getViewCount(item.id, 'audiobook'),
          createdAt: item.created_at,
          creator: {
            ...normalizeAuthor(item.author, item.id),
            followers: 0
          },
          category: item.category || 'Audiobook',
          categories: resolveCategories(item),
          featured: item.featured,
          rating: 4.5,
          bookmarked: isBookmarked(item.id, 'audiobook'),
          likes_count: await getLikeCount(item.id, 'audiobook')
        })));

        const books = await Promise.all((booksResult.data || []).map(async item => ({
          id: item.id,
          type: 'ebook' as const,
          title: item.title,
          thumbnail:
            item.cover_url && item.cover_url.trim().length > 0
              ? item.cover_url
              : getPlaceholderThumbnail('ebook'),
          duration: '4 hours',
          views: await getViewCount(item.id, 'book'),
          createdAt: item.created_at,
          creator: {
            ...normalizeAuthor(item.author, item.id),
            followers: 0
          },
          category: item.category || 'Book',
          categories: resolveCategories(item),
          featured: item.featured,
          rating: 4.5,
          bookmarked: isBookmarked(item.id, 'book'),
          likes_count: await getLikeCount(item.id, 'book')
        })));

        const podcasts = await Promise.all((podcastsResult.data || []).map(async item => ({
          id: item.id,
          type: 'podcast' as const,
          title: item.title,
          thumbnail:
            item.cover_url && item.cover_url.trim().length > 0
              ? item.cover_url
              : getPlaceholderThumbnail('podcast'),
          duration: item.duration,
          views: await getViewCount(item.id, 'podcast'),
          createdAt: item.created_at,
          creator: {
            ...normalizeAuthor(item.author, item.id),
            followers: 0
          },
          category: item.category || 'Podcast',
          categories: resolveCategories(item),
          featured: item.featured,
          rating: 4.5,
          bookmarked: isBookmarked(item.id, 'podcast'),
          likes_count: await getLikeCount(item.id, 'podcast')
        })));

        const contentData = {
          audiobooks,
          ebooks: books,
          articles: [],
          podcasts
        };

        contentCache.set('all-content', {
          data: contentData,
          timestamp: Date.now()
        });

        if (!isMounted) {
          return;
        }

        setAllContent(contentData);
        setLoading(false);
        setInitialLoadComplete(true);

        try {
          safeStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify({ data: contentData, timestamp: Date.now() })
          );
        } catch (storageError) {
          console.warn('Failed to persist home content cache:', storageError);
        }

        console.log('Content loaded and cached:', {
          audiobooks: audiobooks.length,
          books: books.length,
          articles: 0,
          podcasts: podcasts.length
        });
      } catch (err) {
        console.error('Error loading content:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load content');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialLoadComplete(true);
        }
      }
    };

    // If we have fresh in-memory cache and already loaded, reuse it to avoid duplicate network
    const cached = contentCache.get('all-content');
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAllContent(cached.data);
      setLoading(false);
      setInitialLoadComplete(true);
    } else {
      loadAllContent();
    }

    return () => {
      isMounted = false;
    };
  }, [user, initialLoadComplete, initialData]);

  // Filter content based on selected category (client-side filtering for instant response)
  const filteredContent = useMemo(() => {
    if (selectedCategory === 'all') {
      return allContent;
    }

    // Convert selected category slug back to category name for matching
    const getCategoryNameFromSlug = (slug: string) => {
      const categoryMap: { [key: string]: string } = {
        'business': 'Business',
        'finance-investing': 'Finance & Investing',
        'psychology': 'Psychology',
        'philosophy': 'Philosophy',
        'career-growth': 'Career Growth',
        'entrepreneurship': 'Entrepreneurship',
        'history': 'History',
        'politics': 'Politics',
        'science-fiction': 'Science Fiction',
        'productivity': 'Productivity',
        'self-help': 'Self-Help',
        'technology': 'Technology',        
        'biographies': 'Biographies',
        'religion': 'Religion',
        'spirituality': 'Spirituality',                
        'travel': 'Travel',
        'mathematics': 'Mathematics',
        'science': 'Science',        
        'health': 'Health',
      };
      return categoryMap[slug] || slug;
    };

    const targetCategoryName = getCategoryNameFromSlug(selectedCategory);
    console.log('Filtering for category:', selectedCategory, '-> target name:', targetCategoryName);
    
    const filterByCategory = (items: ContentItem[]) => {
      return items.filter(item => {
        console.log(`Checking item "${item.title}":`, {
          category: item.category,
          categories: item.categories,
          targetCategory: targetCategoryName
        });
        
        // First check the categories array (multi-category support)
        if (item.categories && Array.isArray(item.categories) && item.categories.length > 0) {
          const hasExactMatch = item.categories.some(cat => {
            if (!cat) return false;
            
            // Exact match (case-insensitive)
            if (cat.toLowerCase() === targetCategoryName.toLowerCase()) {
              console.log(`✓ Exact match found in categories array: "${cat}" matches "${targetCategoryName}"`);
              return true;
            }
            
            // Special handling for specific cases to prevent false positives
            if (targetCategoryName === 'Science Fiction') {
              // Only match exact "Science Fiction"
              return cat === 'Science Fiction';
            }
            
            if (targetCategoryName === 'Fiction') {
              return cat === 'Fiction';
            }
            
            if (targetCategoryName === 'Science') {
              return cat === 'Science';
            }
            
            return false;
          });
          
          if (hasExactMatch) {
            console.log(`✓ Item "${item.title}" matches category "${targetCategoryName}"`);
            return true;
          }
        }
        
        // Fallback to single category field for backward compatibility
        if (item.category) {
          // Exact match (case-insensitive)
          if (item.category.toLowerCase() === targetCategoryName.toLowerCase()) {
            console.log(`✓ Exact match found in category field: "${item.category}" matches "${targetCategoryName}"`);
            return true;
          }
          
          // Special handling for specific cases
          if (targetCategoryName === 'Science Fiction') {
            return item.category === 'Science Fiction';
          }
          
          if (targetCategoryName === 'Fiction') {
            return item.category === 'Fiction';
          }
          
          if (targetCategoryName === 'Science') {
            return item.category === 'Science';
          }
        }
        
        console.log(`✗ Item "${item.title}" does not match category "${targetCategoryName}"`);
        return false;
      });
    };
    return {
      audiobooks: filterByCategory(allContent.audiobooks),
      ebooks: filterByCategory(allContent.ebooks),
      articles: [],
      podcasts: filterByCategory(allContent.podcasts)
    };
  }, [allContent, selectedCategory]);

  // Check if category has any content
  const hasContent = useMemo(() => {
    const { audiobooks, ebooks, articles, podcasts } = filteredContent;
    return audiobooks.length > 0 || ebooks.length > 0 || articles.length > 0 || podcasts.length > 0;
  }, [filteredContent]);

  const handleAddToShelf = async (contentId: string, contentType: string) => {
    if (!user || !activeShelf) return;

    try {
      if (activeShelf === 'savedForLater' || activeShelf === 'learningGoals') {
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            content_id: contentId,
            content_type: contentType
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shelf_items')
          .insert({
            shelf_id: activeShelf,
            content_id: contentId,
            content_type: contentType
          });

        if (error) throw error;
      }

      // Update the UI to show the item as bookmarked
      setAllContent(prev => ({
        audiobooks: prev.audiobooks.map(item => 
          item.id === contentId && item.type === contentType 
            ? { ...item, bookmarked: true } 
            : item
        ),
        ebooks: prev.ebooks.map(item => 
          item.id === contentId && item.type === contentType 
            ? { ...item, bookmarked: true } 
            : item
        ),
        articles: prev.articles.map(item => 
          item.id === contentId && item.type === contentType 
            ? { ...item, bookmarked: true } 
            : item
        ),
        podcasts: prev.podcasts.map(item => 
          item.id === contentId && item.type === contentType 
            ? { ...item, bookmarked: true } 
            : item
        )
      }));
    } catch (error) {
      console.error('Error adding to shelf:', error);
    }
  };

  // Show skeleton loading on initial load
  if (loading && !initialLoadComplete) {
    return (
      <div className="space-y-8">
        <HeroBannerSkeleton />
        <ContentRowSkeleton />
        <ContentRowSkeleton />
        <ContentRowSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-center">
        <div className="space-y-4 max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-medium">Unable to Load Content</h3>
            <p className="text-muted-foreground mt-2">
              We're having trouble connecting to the server. Please check your internet connection and try again.
            </p>
          </div>
          <button
            onClick={() => {
              contentCache.clear();
              setInitialLoadComplete(false);
              setError(null);
              window.location.reload();
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Show "no content" message if category has no content
  if (initialLoadComplete && !hasContent && selectedCategory !== 'all') {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-center">
        <div className="space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">No content in {selectedCategory}</h3>
            <p className="text-muted-foreground mt-2">
              We don't have any content in this category yet, but we're working on it! 
              Check back soon for new additions.
            </p>
          </div>
          <button
            onClick={() => {
              // Reset to "All" category by updating the URL
              window.history.pushState({}, '', '/');
              window.location.reload();
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse All Content
          </button>
        </div>
      </div>
    );
  }

  const allContentItems = [...filteredContent.audiobooks, ...filteredContent.ebooks, ...filteredContent.podcasts];

  const trendingItems = allContentItems
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);

  const thisMonthDate = new Date();
  thisMonthDate.setMonth(thisMonthDate.getMonth() - 1);

  const popularThisMonth = allContentItems
    .filter(item => new Date(item.createdAt) >= thisMonthDate)
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);

  const newReleases = allContentItems
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15);

  // If a category is selected, show only filtered grid
  if (selectedCategory !== 'all') {
    return (
      <>
        {activeShelf && (
          <AddToShelfBanner
            shelfName={shelfName}
            onClose={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete('shelf');
              window.history.replaceState(
                {},
                '',
                `${window.location.pathname}?${newSearchParams.toString()}`
              );
              setActiveShelf(null);
            }}
          />
        )}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {selectedCategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h2>
            <p className="text-muted-foreground">
              {allContentItems.length} {allContentItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {allContentItems.map((item) => (
              <ContentCard
                key={`${item.type}-${item.id}`}
                item={item}
                activeShelf={activeShelf}
                onAddToShelf={handleAddToShelf}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {activeShelf && (
        <AddToShelfBanner
          shelfName={shelfName}
          onClose={() => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('shelf');
            window.history.replaceState(
              {},
              '',
              `${window.location.pathname}?${newSearchParams.toString()}`
            );
            setActiveShelf(null);
          }}
        />
      )}
      <div className="space-y-10 animate-fadeInUp">
        <HeroBanner items={allContentItems} />

        <ContinueContent />

        {trendingItems.length > 0 && (
          <ContentCarousel
            title="🔥 Trending Now"
            items={trendingItems}
            activeShelf={activeShelf}
            onAddToShelf={handleAddToShelf}
          />
        )}

        <CinematicCollections />

        {popularThisMonth.length > 0 && (
          <ContentCarousel
            title="⭐ Popular This Month"
            items={popularThisMonth}
            activeShelf={activeShelf}
            onAddToShelf={handleAddToShelf}
          />
        )}

        {newReleases.length > 0 && (
          <ContentCarousel
            title="✨ New Releases"
            items={newReleases}
            activeShelf={activeShelf}
            onAddToShelf={handleAddToShelf}
          />
        )}

        {filteredContent.podcasts.length > 0 && (
          <ContentCarousel
            title="🎙️ Top Podcasts"
            items={filteredContent.podcasts.slice(0, 15)}
            activeShelf={activeShelf}
            onAddToShelf={handleAddToShelf}
          />
        )}

        {filteredContent.ebooks.length > 0 && (
          <ContentCarousel
            title="📚 Must-Read Books"
            items={filteredContent.ebooks.slice(0, 15)}
            activeShelf={activeShelf}
            onAddToShelf={handleAddToShelf}
          />
        )}

        {filteredContent.articles.length > 0 && (
          <ContentCarousel
            title="📝 Latest Articles"
            items={filteredContent.articles.slice(0, 15)}
            activeShelf={activeShelf}
            onAddToShelf={handleAddToShelf}
          />
        )}

        <SmartRecommendations />
      </div>
    </>
  );
}
