import React, { useEffect, useState } from "react";
import { Play, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ImageLoader } from "../image-loader";
import { useAudio } from "@/lib/audio-context";

interface Collection {
  id: string;
  name: string;
  slug: string;
  count: number;
  mainCover: string;
  layeredCovers: string[];
  description: string;
}

export function CinematicCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const { setPlaylist, setCurrentTrackIndex, playAudio } = useAudio();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const categories = [
          { name: "Business", description: "Master the art of success" },
          { name: "Psychology", description: "Understand the human mind" },
          { name: "Self-Help", description: "Transform your life" },
          { name: "Technology", description: "Embrace the future" },
          { name: "Philosophy", description: "Question everything" },
          { name: "Science", description: "Explore the universe" },
          { name: "History", description: "Learn from the past" },
          { name: "Entrepreneurship", description: "Build your empire" },
        ];

        const collectionsData = await Promise.all(
          categories.map(async (category) => {
            const [audiobooksResult, booksResult, podcastsResult] =
              await Promise.all([
                supabase
                  .from("audiobooks")
                  .select("id, cover_url, title")
                  .eq("status", "published")
                  .contains("categories", [category.name])
                  .order("created_at", { ascending: false })
                  .limit(10),
                supabase
                  .from("books")
                  .select("id, cover_url, title")
                  .eq("status", "published")
                  .eq("category", category.name)
                  .order("created_at", { ascending: false })
                  .limit(10),
                supabase
                  .from("podcast_episodes")
                  .select("id, cover_url, title")
                  .eq("status", "published")
                  .contains("categories", [category.name])
                  .order("created_at", { ascending: false })
                  .limit(10),
              ]);

            const allItems = [
              ...(audiobooksResult.data || []),
              ...(booksResult.data || []),
              ...(podcastsResult.data || []),
            ].filter((item) => item.cover_url);

            // Get unique items by both ID and cover URL to ensure truly unique content
            const seenIds = new Set<string>();
            const seenCovers = new Set<string>();
            const uniqueCovers = allItems
              .filter((item) => {
                if (seenIds.has(item.id) || seenCovers.has(item.cover_url)) {
                  return false;
                }
                seenIds.add(item.id);
                seenCovers.add(item.cover_url);
                return true;
              })
              .slice(0, 4);

            const totalCount =
              (audiobooksResult.data?.length || 0) +
              (booksResult.data?.length || 0) +
              (podcastsResult.data?.length || 0);

            return {
              id: category.name.toLowerCase(),
              name: category.name,
              slug: category.name.toLowerCase().replace(/\s+/g, "-"),
              count: totalCount,
              mainCover: uniqueCovers[0]?.cover_url || "",
              layeredCovers: uniqueCovers
                .slice(1, 4)
                .map((item) => item.cover_url),
              description: category.description,
            };
          })
        );

        setCollections(
          collectionsData.filter((c) => c.count > 0 && c.mainCover)
        );
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading || collections.length === 0) {
    return null;
  }

  const handleCollectionClick = async (collection: Collection) => {
    // Load all items from this collection as a playlist
    try {
      const categoryName = collection.name;

      const [audiobooksResult, podcastsResult] = await Promise.all([
        supabase
          .from("audiobooks")
          .select(
            `
            id,
            title,
            cover_url,
            author:profiles!audiobooks_author_id_fkey (
              id,
              name,
              avatar_url,
              username
            )
          `
          )
          .eq("status", "published")
          .contains("categories", [categoryName])
          .order("created_at", { ascending: false }),

        supabase
          .from("podcast_episodes")
          .select(
            `
            id,
            title,
            cover_url,
            author:profiles!podcast_episodes_author_id_fkey (
              id,
              name,
              avatar_url,
              username
            )
          `
          )
          .eq("status", "published")
          .contains("categories", [categoryName])
          .order("created_at", { ascending: false }),
      ]);

      const normalizeAuthor = (author: any) => {
        const data = Array.isArray(author) ? author[0] : author;
        return {
          id: data?.id || "",
          name: data?.name || data?.username || "Unknown Creator",
          avatar: data?.avatar_url || "",
          username: data?.username || "creator",
        };
      };

      const audiobooks = (audiobooksResult.data || []).map((item) => {
        const author = normalizeAuthor(item.author);
        return {
          id: item.id,
          title: item.title,
          author: author.name,
          authorId: author.id,
          authorUsername: author.username,
          thumbnail: item.cover_url || "",
          type: "audiobook" as const,
          contentUrl: `/player/audiobook-${item.id}`,
        };
      });

      const podcasts = (podcastsResult.data || []).map((item) => {
        const author = normalizeAuthor(item.author);
        return {
          id: item.id,
          title: item.title,
          author: author.name,
          authorId: author.id,
          authorUsername: author.username,
          thumbnail: item.cover_url || "",
          type: "podcast" as const,
          contentUrl: `/player/podcast-${item.id}`,
        };
      });

      const playlistItems = [...audiobooks, ...podcasts];

      if (playlistItems.length > 0) {
        // Set the playlist
        setPlaylist(playlistItems);
        setCurrentTrackIndex(0);

        // Play the first item immediately (starts bottom player, then navigates)
        playAudio(playlistItems[0], true);
      }
    } catch (error) {
      console.error("Error loading collection playlist:", error);
    }
  };

  return (
    <div className="mb-12 -mx-4 md:mx-0 px-4 md:px-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Popular Collections</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {collections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => handleCollectionClick(collection)}
            className="group relative bg-gradient-to-br from-background to-muted/30 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105"
          >
            <div className="relative aspect-[3/4] p-4">
              <div className="relative w-full h-full perspective-1000">
                {collection.layeredCovers.map((cover, idx) => (
                  <div
                    key={idx}
                    className="absolute inset-0 rounded-lg overflow-hidden shadow-xl transition-all duration-500 group-hover:scale-95"
                    style={{
                      transform: `translateX(${(idx + 1) * 8}px) translateY(${
                        (idx + 1) * 8
                      }px) scale(${1 - (idx + 1) * 0.05})`,
                      zIndex: 3 - idx,
                      opacity: 0.6 - idx * 0.15,
                    }}
                  >
                    <ImageLoader
                      src={cover}
                      alt={`${collection.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                ))}

                <div className="relative rounded-lg overflow-hidden shadow-2xl z-10 transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl">
                  <ImageLoader
                    src={collection.mainCover}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-6 h-6 text-black ml-1 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-1">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                {collection.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {collection.description}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  {collection.count} items
                </span>
                <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Collection
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
