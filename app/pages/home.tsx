import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ContentLayout } from "@/components/content/content-layout";
import { ContinueContent } from "@/components/content/continue-content";
import { ContentCarousel } from "@/components/content/content-carousel";
import { ContentCard } from "@/components/content/content-card";
import { SmartRecommendations } from "@/components/content/smart-recommendations";
import { CinematicCollections } from "@/components/content/cinematic-collections";
import { ContentRowSkeleton } from "@/components/content/skeleton-loader";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AddToShelfBanner } from "@/components/library/add-to-shelf-banner";
import type { ContentItem } from "@/lib/types";

interface HomeProps {
  selectedCategory?: string;
  initialData?: {
    audiobooks: any[];
    books: any[];
    podcasts: any[];
    articles: any[];
    views?: Array<{ content_id: string; content_type: string }>;
    likes?: Array<{ content_id: string; content_type: string; rating: number }>;
  };
}

// Cache for content data
const contentCache = new Map<
  string,
  {
    data: {
      audiobooks: ContentItem[];
      ebooks: ContentItem[];
      articles: ContentItem[];
      podcasts: ContentItem[];
    };
    timestamp: number;
  }
>();

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes - increased cache duration

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const isBrowser = typeof window !== "undefined";

const safeStorage: StorageLike =
  isBrowser && typeof window.localStorage !== "undefined"
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      };

const LOCAL_STORAGE_KEY = "inlits:home-content";

const getPlaceholderThumbnail = (type: "audiobook" | "ebook" | "podcast") => {
  switch (type) {
    case "audiobook":
      return "https://placehold.co/600x800?text=Audiobook";
    case "podcast":
      return "https://placehold.co/600x600?text=Podcast";
    case "ebook":
    default:
      return "https://placehold.co/600x900?text=Book";
  }
};

const getPlaceholderAvatar = (initial: string) =>
  `https://placehold.co/80x80?text=${encodeURIComponent(initial || "U")}`;

export function Home({ selectedCategory = "all", initialData }: HomeProps) {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [allContent, setAllContent] = useState<{
    audiobooks: ContentItem[];
    ebooks: ContentItem[];
    articles: ContentItem[];
    podcasts: ContentItem[];
  }>(() => {
    // Don't transform here - let useEffect handle it properly
    return {
      audiobooks: [],
      ebooks: [],
      articles: [],
      podcasts: [],
    };
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Get shelf parameter from URL
  const shelfParam = searchParams.get("shelf");
  const [activeShelf, setActiveShelf] = useState<string | null>(shelfParam);
  const [shelfName, setShelfName] = useState<string>("");

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

        // Force update by creating new object references
        setAllContent({
          audiobooks: [...parsed.data.audiobooks],
          ebooks: [...parsed.data.ebooks],
          articles: [...parsed.data.articles],
          podcasts: [...parsed.data.podcasts],
        });
        setLoading(false);
        setInitialLoadComplete(true);
        contentCache.set("all-content", {
          data: parsed.data,
          timestamp: parsed.timestamp,
        });
        if (!isFresh) {
          console.info("Home content cache is stale; refreshing data...");
          // Force reload if stale
          setInitialLoadComplete(false);
        }
      }
    } catch (error) {
      console.warn("Failed to restore home content cache:", error);
    }
  }, []);

  // Get shelf name based on the parameter
  useEffect(() => {
    if (!shelfParam) {
      setActiveShelf(null);
      return;
    }

    setActiveShelf(shelfParam);

    if (shelfParam === "savedForLater") {
      setShelfName("Saved for Later");
    } else if (shelfParam === "learningGoals") {
      setShelfName("2025 Learning Goals");
    } else {
      const fetchShelfName = async () => {
        try {
          const { data, error } = await supabase
            .from("custom_shelves")
            .select("name")
            .eq("id", shelfParam)
            .single();

          if (error) throw error;
          if (data) {
            setShelfName(data.name);
          }
        } catch (err) {
          console.error("Error fetching shelf name:", err);
          setShelfName("Custom Shelf");
        }
      };

      fetchShelfName();
    }
  }, [shelfParam]);

  // Load content once mounted and refresh cache on user changes
  useEffect(() => {
    let isMounted = true;

    const loadAllContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use SSR data if available, otherwise fetch from client
        let audiobooksData, booksData, podcastsData, viewsDataRaw, likesDataRaw;

        if (
          initialData &&
          initialData.audiobooks &&
          initialData.audiobooks.length > 0
        ) {
          // Use SSR data - fastest path
          audiobooksData = initialData.audiobooks;
          booksData = initialData.books;
          podcastsData = initialData.podcasts;
          viewsDataRaw = initialData.views || [];
          likesDataRaw = initialData.likes || [];
          console.log("✅ Using SSR data - instant load!");
        } else {
          // Fallback to client-side fetch
          const [
            audiobooksResult,
            booksResult,
            podcastsResult,
            viewsData,
            likesData,
          ] = await Promise.all([
            supabase
              .from("audiobooks")
              .select(
                `
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
              `
              )
              .eq("status", "published")
              .order("featured", { ascending: false })
              .order("created_at", { ascending: false }),

            supabase
              .from("books")
              .select(
                `
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
              `
              )
              .eq("status", "published")
              .order("featured", { ascending: false })
              .order("created_at", { ascending: false }),

            supabase
              .from("podcast_episodes")
              .select(
                `
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
              `
              )
              .eq("status", "published")
              .order("featured", { ascending: false })
              .order("created_at", { ascending: false }),

            supabase.from("content_views").select("content_id, content_type"),
            supabase
              .from("ratings")
              .select("content_id, content_type, rating")
              .eq("rating", 5),
          ]);

          // Check for errors
          if (audiobooksResult.error) {
            console.error("Audiobooks error:", audiobooksResult.error);
          }
          if (booksResult.error) {
            console.error("Books error:", booksResult.error);
          }
          if (podcastsResult.error) {
            console.error("Podcasts error:", podcastsResult.error);
          }

          if (
            audiobooksResult.error &&
            booksResult.error &&
            podcastsResult.error
          ) {
            throw new Error(
              "Unable to load content. Please check your connection and try again."
            );
          }

          audiobooksData = audiobooksResult.data || [];
          booksData = booksResult.data || [];
          podcastsData = podcastsResult.data || [];
          viewsDataRaw = viewsData.data || [];
          likesDataRaw = likesData.data || [];
        }

        // Minimal logging for performance
        if (process.env.NODE_ENV === "development") {
          console.log("Raw data loaded:", {
            audiobooks: audiobooksData.length,
            books: booksData.length,
            podcasts: podcastsData.length,
          });
        }

        // Get user bookmarks in parallel (non-blocking)
        let userBookmarks: { content_id: string; content_type: string }[] = [];
        const bookmarksPromise = user
          ? supabase
              .from("bookmarks")
              .select("content_id, content_type")
              .eq("user_id", user.id)
          : Promise.resolve({ data: [] });

        // Create lookup maps for O(1) access
        const viewsMap = new Map<string, number>();
        viewsDataRaw.forEach((view: any) => {
          const key = `${view.content_type}:${view.content_id}`;
          viewsMap.set(key, (viewsMap.get(key) || 0) + 1);
        });

        const likesMap = new Map<string, number>();
        likesDataRaw.forEach((like: any) => {
          const key = `${like.content_type}:${like.content_id}`;
          likesMap.set(key, (likesMap.get(key) || 0) + 1);
        });

        const getViewCount = (contentId: string, contentType: string) => {
          return viewsMap.get(`${contentType}:${contentId}`) || 0;
        };

        const getLikeCount = (contentId: string, contentType: string) => {
          return likesMap.get(`${contentType}:${contentId}`) || 0;
        };

        // Start with no bookmarks for faster initial render
        const isBookmarked = (id: string, type: string) => {
          return false; // Will be updated after initial render
        };

        const normalizeAuthor = (author: unknown, fallbackId: string) => {
          const data = Array.isArray(author) ? author[0] : author;
          const name =
            typeof data?.name === "string"
              ? data.name
              : typeof data?.username === "string"
              ? data.username
              : "Unknown Creator";
          const initial = name[0]?.toUpperCase() || "U";
          return {
            id: typeof data?.id === "string" ? data.id : fallbackId,
            name,
            avatar:
              typeof data?.avatar_url === "string" &&
              data.avatar_url.trim().length > 0
                ? data.avatar_url
                : getPlaceholderAvatar(initial),
            username:
              typeof data?.username === "string" && data.username.length > 0
                ? data.username
                : "creator",
          };
        };

        const resolveCategories = (item: unknown): string[] => {
          if (item && typeof item === "object" && "categories" in item) {
            const candidate = (item as { categories?: string[] }).categories;
            if (Array.isArray(candidate)) {
              return candidate.filter(
                (value): value is string => typeof value === "string"
              );
            }
          }

          if (item && typeof item === "object" && "category" in item) {
            const value = (item as { category?: string }).category;
            if (typeof value === "string" && value.length > 0) {
              return [value];
            }
          }

          return [];
        };

        // Transform data to ContentItem format (synchronous now - much faster!)
        const audiobooks = audiobooksData.map((item: any) => ({
          id: item.id,
          type: "audiobook" as const,
          title: item.title,
          thumbnail:
            item.cover_url ||
            `https://source.unsplash.com/random/800x600?audiobook&sig=${item.id}`,
          duration: "2 hours",
          views: getViewCount(item.id, "audiobook"),
          createdAt: item.created_at,
          creator: {
            ...normalizeAuthor(item.author, item.id),
            followers: 0,
          },
          category: item.category || "Audiobook",
          categories: resolveCategories(item),
          featured: item.featured,
          rating: 4.5,
          bookmarked: isBookmarked(item.id, "audiobook"),
          likes_count: getLikeCount(item.id, "audiobook"),
        }));

        const books = booksData.map((item: any) => ({
          id: item.id,
          type: "ebook" as const,
          title: item.title,
          thumbnail:
            item.cover_url ||
            `https://source.unsplash.com/random/800x600?book&sig=${item.id}`,
          duration: "4 hours",
          views: getViewCount(item.id, "book"),
          createdAt: item.created_at,
          creator: {
            ...normalizeAuthor(item.author, item.id),
            followers: 0,
          },
          category: item.category || "Book",
          categories: resolveCategories(item),
          featured: item.featured,
          rating: 4.5,
          bookmarked: isBookmarked(item.id, "book"),
          likes_count: getLikeCount(item.id, "book"),
        }));

        const podcasts = podcastsData.map((item: any) => ({
          id: item.id,
          type: "podcast" as const,
          title: item.title,
          thumbnail:
            item.cover_url ||
            `https://source.unsplash.com/random/800x600?podcast&sig=${item.id}`,
          duration: item.duration,
          views: getViewCount(item.id, "podcast"),
          createdAt: item.created_at,
          creator: {
            ...normalizeAuthor(item.author, item.id),
            followers: 0,
          },
          category: item.category || "Podcast",
          categories: resolveCategories(item),
          featured: item.featured,
          rating: 4.5,
          bookmarked: isBookmarked(item.id, "podcast"),
          likes_count: getLikeCount(item.id, "podcast"),
        }));

        const contentData = {
          audiobooks,
          ebooks: books,
          articles: [],
          podcasts,
        };

        contentCache.set("all-content", {
          data: contentData,
          timestamp: Date.now(),
        });

        if (!isMounted) {
          return;
        }

        setAllContent(contentData);
        setLoading(false);
        setInitialLoadComplete(true);

        // Resolve bookmarks asynchronously after initial render
        bookmarksPromise.then(({ data: bookmarksData }) => {
          if (!isMounted || !bookmarksData || bookmarksData.length === 0)
            return;

          userBookmarks = bookmarksData;

          // Update content with bookmark status
          const updateBookmarks = (items: ContentItem[]) =>
            items.map((item) => ({
              ...item,
              bookmarked: userBookmarks.some(
                (b) => b.content_id === item.id && b.content_type === item.type
              ),
            }));

          setAllContent({
            audiobooks: updateBookmarks(contentData.audiobooks),
            ebooks: updateBookmarks(contentData.ebooks),
            articles: updateBookmarks(contentData.articles),
            podcasts: updateBookmarks(contentData.podcasts),
          });
        });

        // Save to localStorage asynchronously (non-blocking)
        setTimeout(() => {
          try {
            safeStorage.setItem(
              LOCAL_STORAGE_KEY,
              JSON.stringify({ data: contentData, timestamp: Date.now() })
            );
          } catch (storageError) {
            console.warn("Failed to persist home content cache:", storageError);
          }
        }, 0);
      } catch (err) {
        console.error("Error loading content:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load content"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialLoadComplete(true);
        }
      }
    };

    // Check for fresh in-memory cache first
    const cached = contentCache.get("all-content");
    const hasFreshCache =
      cached && Date.now() - cached.timestamp < CACHE_DURATION;

    // Skip if we have fresh cache AND same initial data
    if (hasFreshCache && !initialData) {
      setAllContent(cached.data);
      setLoading(false);
      setInitialLoadComplete(true);
      return;
    }

    // Always load if we have SSR data or no cache
    loadAllContent();

    return () => {
      isMounted = false;
    };
  }, [user, initialData]);

  // Filter content based on selected category (client-side filtering for instant response)
  const filteredContent = useMemo(() => {
    if (selectedCategory === "all") {
      return allContent;
    }

    // Convert selected category slug back to category name for matching
    const getCategoryNameFromSlug = (slug: string) => {
      const categoryMap: { [key: string]: string } = {
        business: "Business",
        "finance-investing": "Finance & Investing",
        psychology: "Psychology",
        philosophy: "Philosophy",
        "career-growth": "Career Growth",
        entrepreneurship: "Entrepreneurship",
        history: "History",
        politics: "Politics",
        "science-fiction": "Science Fiction",
        productivity: "Productivity",
        "self-help": "Self-Help",
        technology: "Technology",
        biographies: "Biographies",
        religion: "Religion",
        spirituality: "Spirituality",
        travel: "Travel",
        mathematics: "Mathematics",
        science: "Science",
        health: "Health",
      };
      return categoryMap[slug] || slug;
    };

    const targetCategoryName = getCategoryNameFromSlug(selectedCategory);
    console.log(
      "Filtering for category:",
      selectedCategory,
      "-> target name:",
      targetCategoryName
    );

    const filterByCategory = (items: ContentItem[]) => {
      return items.filter((item) => {
        console.log(`Checking item "${item.title}":`, {
          category: item.category,
          categories: item.categories,
          targetCategory: targetCategoryName,
        });

        // First check the categories array (multi-category support)
        if (
          item.categories &&
          Array.isArray(item.categories) &&
          item.categories.length > 0
        ) {
          const hasExactMatch = item.categories.some((cat) => {
            if (!cat) return false;

            // Exact match (case-insensitive)
            if (cat.toLowerCase() === targetCategoryName.toLowerCase()) {
              console.log(
                `✓ Exact match found in categories array: "${cat}" matches "${targetCategoryName}"`
              );
              return true;
            }

            // Special handling for specific cases to prevent false positives
            if (targetCategoryName === "Science Fiction") {
              // Only match exact "Science Fiction"
              return cat === "Science Fiction";
            }

            if (targetCategoryName === "Fiction") {
              return cat === "Fiction";
            }

            if (targetCategoryName === "Science") {
              return cat === "Science";
            }

            return false;
          });

          if (hasExactMatch) {
            console.log(
              `✓ Item "${item.title}" matches category "${targetCategoryName}"`
            );
            return true;
          }
        }

        // Fallback to single category field for backward compatibility
        if (item.category) {
          // Exact match (case-insensitive)
          if (
            item.category.toLowerCase() === targetCategoryName.toLowerCase()
          ) {
            console.log(
              `✓ Exact match found in category field: "${item.category}" matches "${targetCategoryName}"`
            );
            return true;
          }

          // Special handling for specific cases
          if (targetCategoryName === "Science Fiction") {
            return item.category === "Science Fiction";
          }

          if (targetCategoryName === "Fiction") {
            return item.category === "Fiction";
          }

          if (targetCategoryName === "Science") {
            return item.category === "Science";
          }
        }

        console.log(
          `✗ Item "${item.title}" does not match category "${targetCategoryName}"`
        );
        return false;
      });
    };
    return {
      audiobooks: filterByCategory(allContent.audiobooks),
      ebooks: filterByCategory(allContent.ebooks),
      articles: [],
      podcasts: filterByCategory(allContent.podcasts),
    };
  }, [allContent, selectedCategory]);

  // Check if category has any content
  const hasContent = useMemo(() => {
    const { audiobooks, ebooks, articles, podcasts } = filteredContent;
    return (
      audiobooks.length > 0 ||
      ebooks.length > 0 ||
      articles.length > 0 ||
      podcasts.length > 0
    );
  }, [filteredContent]);

  const handleAddToShelf = async (contentId: string, contentType: string) => {
    if (!user || !activeShelf) return;

    try {
      if (activeShelf === "savedForLater" || activeShelf === "learningGoals") {
        const { error } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.from("shelf_items").insert({
          shelf_id: activeShelf,
          content_id: contentId,
          content_type: contentType,
        });

        if (error) throw error;
      }

      // Update the UI to show the item as bookmarked
      setAllContent((prev) => ({
        audiobooks: prev.audiobooks.map((item) =>
          item.id === contentId && item.type === contentType
            ? { ...item, bookmarked: true }
            : item
        ),
        ebooks: prev.ebooks.map((item) =>
          item.id === contentId && item.type === contentType
            ? { ...item, bookmarked: true }
            : item
        ),
        articles: prev.articles.map((item) =>
          item.id === contentId && item.type === contentType
            ? { ...item, bookmarked: true }
            : item
        ),
        podcasts: prev.podcasts.map((item) =>
          item.id === contentId && item.type === contentType
            ? { ...item, bookmarked: true }
            : item
        ),
      }));
    } catch (error) {
      console.error("Error adding to shelf:", error);
    }
  };

  // Show skeleton loading on initial load
  if (loading && !initialLoadComplete) {
    return (
      <div className="space-y-8">
        <ContentRowSkeleton />
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
              We're having trouble connecting to the server. Please check your
              internet connection and try again.
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
  if (initialLoadComplete && !hasContent && selectedCategory !== "all") {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-center">
        <div className="space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">
              No content in {selectedCategory}
            </h3>
            <p className="text-muted-foreground mt-2">
              We don't have any content in this category yet, but we're working
              on it! Check back soon for new additions.
            </p>
          </div>
          <button
            onClick={() => {
              // Reset to "All" category by updating the URL
              window.history.pushState({}, "", "/");
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

  const allContentItems = [
    ...filteredContent.audiobooks,
    ...filteredContent.ebooks,
    ...filteredContent.podcasts,
  ];

  // Shuffle function for variety
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Trending: Top viewed items
  const trendingItems = allContentItems
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);

  const thisMonthDate = new Date();
  thisMonthDate.setMonth(thisMonthDate.getMonth() - 1);

  // Popular This Month: Recent items with high views, excluding trending
  const trendingIds = new Set(trendingItems.map((item) => item.id));
  const popularThisMonth = allContentItems
    .filter(
      (item) =>
        new Date(item.createdAt) >= thisMonthDate && !trendingIds.has(item.id)
    )
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);

  // New Releases: Latest items, excluding trending and popular
  const usedIds = new Set([
    ...trendingItems.map((item) => item.id),
    ...popularThisMonth.map((item) => item.id),
  ]);
  const newReleases = allContentItems
    .filter((item) => !usedIds.has(item.id))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 15);

  // If a category is selected, show only filtered grid
  if (selectedCategory !== "all") {
    return (
      <>
        {activeShelf && (
          <AddToShelfBanner
            shelfName={shelfName}
            onClose={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete("shelf");
              window.history.replaceState(
                {},
                "",
                `${window.location.pathname}?${newSearchParams.toString()}`
              );
              setActiveShelf(null);
            }}
          />
        )}
        <div className="space-y-6 px-4 md:px-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {selectedCategory
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </h2>
            <p className="text-muted-foreground">
              {allContentItems.length}{" "}
              {allContentItems.length === 1 ? "item" : "items"}
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
            newSearchParams.delete("shelf");
            window.history.replaceState(
              {},
              "",
              `${window.location.pathname}?${newSearchParams.toString()}`
            );
            setActiveShelf(null);
          }}
        />
      )}
      <div className="space-y-10 animate-fadeInUp">
        <ContinueContent />

        <ContentCarousel
          title="🔥 Trending Now"
          items={trendingItems}
          activeShelf={activeShelf}
          onAddToShelf={handleAddToShelf}
        />

        <CinematicCollections />

        <ContentCarousel
          title="⭐ Popular This Month"
          items={popularThisMonth}
          activeShelf={activeShelf}
          onAddToShelf={handleAddToShelf}
        />

        <ContentCarousel
          title="✨ New Releases"
          items={newReleases}
          activeShelf={activeShelf}
          onAddToShelf={handleAddToShelf}
        />

        <ContentCarousel
          title="🎙️ Top Podcasts"
          items={shuffleArray(filteredContent.podcasts).slice(0, 15)}
          activeShelf={activeShelf}
          onAddToShelf={handleAddToShelf}
        />

        <ContentCarousel
          title="📚 Must-Read Books"
          items={shuffleArray(filteredContent.ebooks).slice(0, 15)}
          activeShelf={activeShelf}
          onAddToShelf={handleAddToShelf}
        />

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
