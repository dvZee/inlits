import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { ContentCarousel } from "./content-carousel";
import type { ContentItem } from "@/lib/types";

interface SmartRecommendationsProps {
  currentContent?: ContentItem;
}

export function SmartRecommendations({
  currentContent,
}: SmartRecommendationsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSmartRecommendations = async () => {
      try {
        let categoryFilter: string[] = [];
        let userPreferredCategories: string[] = [];

        if (
          currentContent?.categories &&
          currentContent.categories.length > 0
        ) {
          categoryFilter = currentContent.categories;
        } else if (currentContent?.category) {
          categoryFilter = [currentContent.category];
        }

        if (user) {
          const { data: historyData } = await supabase
            .from("content_history")
            .select(
              `
              content_id,
              content_type,
              audiobooks:audiobooks!content_history_content_id_fkey(categories, category),
              books:books!content_history_content_id_fkey(category),
              podcasts:podcast_episodes!content_history_content_id_fkey(categories, category)
            `
            )
            .eq("user_id", user.id)
            .limit(20);

          if (historyData) {
            const categoryCounts: Record<string, number> = {};

            historyData.forEach((item) => {
              let itemCategories: string[] = [];

              if (item.content_type === "audiobook" && item.audiobooks) {
                const ab = Array.isArray(item.audiobooks)
                  ? item.audiobooks[0]
                  : item.audiobooks;
                itemCategories =
                  ab?.categories || (ab?.category ? [ab.category] : []);
              } else if (item.content_type === "book" && item.books) {
                const book = Array.isArray(item.books)
                  ? item.books[0]
                  : item.books;
                if (book?.category) itemCategories = [book.category];
              } else if (item.content_type === "podcast" && item.podcasts) {
                const pod = Array.isArray(item.podcasts)
                  ? item.podcasts[0]
                  : item.podcasts;
                itemCategories =
                  pod?.categories || (pod?.category ? [pod.category] : []);
              }

              itemCategories.forEach((cat) => {
                if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
              });
            });

            userPreferredCategories = Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([cat]) => cat);

            if (
              categoryFilter.length === 0 &&
              userPreferredCategories.length > 0
            ) {
              categoryFilter = userPreferredCategories;
            }
          }
        }

        const [audiobooksResult, booksResult, podcastsResult] =
          await Promise.all([
            supabase
              .from("audiobooks")
              .select(
                `
              id,
              title,
              cover_url,
              category,
              categories,
              is_full_book,
              created_at,
              author:profiles!audiobooks_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `
              )
              .eq("status", "published")
              .order("created_at", { ascending: false })
              .limit(20),

            supabase
              .from("books")
              .select(
                `
              id,
              title,
              cover_url,
              category,
              is_full_book,
              created_at,
              author:profiles!books_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `
              )
              .eq("status", "published")
              .order("created_at", { ascending: false })
              .limit(20),

            supabase
              .from("podcast_episodes")
              .select(
                `
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
            `
              )
              .eq("status", "published")
              .order("created_at", { ascending: false })
              .limit(20),
          ]);

        const items: (ContentItem & { categoryMatchScore: number })[] = [];

        const processContent = (data: any[], type: ContentItem["type"]) => {
          data?.forEach((item) => {
            const author = Array.isArray(item.author)
              ? item.author[0]
              : item.author;

            if (currentContent && item.id === currentContent.id) {
              return;
            }

            const itemCategories =
              item.categories || (item.category ? [item.category] : []);

            const categoryMatchScore = categoryFilter.reduce(
              (score, cat) =>
                itemCategories.includes(cat) ? score + 1 : score,
              0
            );

            const matchesCategory =
              categoryFilter.length === 0 || categoryMatchScore > 0;

            if (matchesCategory) {
              items.push({
                id: item.id,
                type,
                title: item.title,
                thumbnail:
                  item.cover_url || "https://placehold.co/600x800?text=Content",
                duration: type === "podcast" ? item.duration : "2 hours",
                views: 0,
                createdAt: item.created_at,
                creator: author
                  ? {
                      id: author.id,
                      name: author.name || "Unknown",
                      avatar:
                        author.avatar_url ||
                        "https://placehold.co/80x80?text=U",
                      username: author.username || "user",
                      followers: 0,
                    }
                  : undefined,
                category: item.category || "",
                categories: itemCategories,
                featured: false,
                rating: 4.5,
                is_full_book: item.is_full_book ?? true,
                categoryMatchScore,
              });
            }
          });
        };

        processContent(audiobooksResult.data || [], "audiobook");
        processContent(booksResult.data || [], "ebook");
        processContent(podcastsResult.data || [], "podcast");

        const sorted = items.sort((a, b) => {
          if (a.categoryMatchScore !== b.categoryMatchScore) {
            return b.categoryMatchScore - a.categoryMatchScore;
          }
          return Math.random() - 0.5;
        });

        setRecommendations(sorted.slice(0, 15));
      } catch (error) {
        console.error("Error fetching smart recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSmartRecommendations();
  }, [user, currentContent]);

  if (loading || recommendations.length === 0) {
    return null;
  }

  return (
    <ContentCarousel
      title={user ? "Recommended for You" : "You May Also Like"}
      items={recommendations}
    />
  );
}
