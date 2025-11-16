import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { h as useAudio, s as supabase, I as ImageLoader } from "./server-build-CCRgnkMn.js";
import { ChevronLeft, Shuffle, Play, ChevronRight, Repeat } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function CollectionPlayerPage() {
  var _a;
  const { category } = useParams();
  const navigate = useNavigate();
  const { playAudio } = useAudio();
  const [items, setItems] = useState([]);
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
      const categoryName = category.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
      const [audiobooksResult, booksResult, podcastsResult] = await Promise.all([
        supabase.from("audiobooks").select(`
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
          `).eq("status", "published").contains("categories", [categoryName]).order("created_at", { ascending: false }),
        supabase.from("books").select(`
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
          `).eq("status", "published").eq("category", categoryName).order("created_at", { ascending: false }),
        supabase.from("podcast_episodes").select(`
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
          `).eq("status", "published").contains("categories", [categoryName]).order("created_at", { ascending: false })
      ]);
      const normalizeAuthor = (author) => {
        const data = Array.isArray(author) ? author[0] : author;
        return {
          id: (data == null ? void 0 : data.id) || "",
          name: (data == null ? void 0 : data.name) || (data == null ? void 0 : data.username) || "Unknown Creator",
          avatar: (data == null ? void 0 : data.avatar_url) || "",
          username: (data == null ? void 0 : data.username) || "creator"
        };
      };
      const audiobooks = (audiobooksResult.data || []).map((item) => ({
        id: item.id,
        type: "audiobook",
        title: item.title,
        thumbnail: item.cover_url || "",
        duration: item.duration || "2 hours",
        views: 0,
        createdAt: item.created_at,
        creator: {
          ...normalizeAuthor(item.author),
          followers: 0
        },
        category: item.category || "Audiobook",
        categories: item.categories || [],
        featured: false,
        rating: 4.5,
        bookmarked: false,
        likes_count: 0
      }));
      const books = (booksResult.data || []).map((item) => ({
        id: item.id,
        type: "ebook",
        title: item.title,
        thumbnail: item.cover_url || "",
        duration: "4 hours",
        views: 0,
        createdAt: item.created_at,
        creator: {
          ...normalizeAuthor(item.author),
          followers: 0
        },
        category: item.category || "Book",
        categories: [],
        featured: false,
        rating: 4.5,
        bookmarked: false,
        likes_count: 0
      }));
      const podcasts = (podcastsResult.data || []).map((item) => ({
        id: item.id,
        type: "podcast",
        title: item.title,
        thumbnail: item.cover_url || "",
        duration: item.duration || "45 min",
        views: 0,
        createdAt: item.created_at,
        creator: {
          ...normalizeAuthor(item.author),
          followers: 0
        },
        category: item.category || "Podcast",
        categories: item.categories || [],
        featured: false,
        rating: 4.5,
        bookmarked: false,
        likes_count: 0
      }));
      const allItems = [...audiobooks, ...podcasts, ...books];
      setItems(allItems);
    } catch (error) {
      console.error("Error loading collection:", error);
    } finally {
      setLoading(false);
    }
  };
  const playItem = (index) => {
    var _a2, _b, _c;
    const item = items[index];
    if (!item) return;
    setCurrentIndex(index);
    if (item.type === "audiobook" || item.type === "podcast") {
      playAudio({
        id: item.id,
        title: item.title,
        author: ((_a2 = item.creator) == null ? void 0 : _a2.name) || "Unknown",
        authorId: ((_b = item.creator) == null ? void 0 : _b.id) || "",
        authorUsername: ((_c = item.creator) == null ? void 0 : _c.username) || "creator",
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
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Loading collection..." })
    ] }) });
  }
  const currentItem = items[currentIndex];
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-b from-background to-muted/30", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => navigate(-1),
        className: "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6",
        children: [
          /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" }),
          "Back"
        ]
      }
    ),
    currentItem && /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-8 mb-12", children: [
      /* @__PURE__ */ jsx("div", { className: "relative aspect-square max-w-md mx-auto w-full rounded-2xl overflow-hidden shadow-2xl", children: /* @__PURE__ */ jsx(
        ImageLoader,
        {
          src: currentItem.thumbnail,
          alt: currentItem.title,
          className: "w-full h-full object-cover",
          loadingStrategy: "eager"
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-2", children: currentItem.title }),
          /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground", children: ((_a = currentItem.creator) == null ? void 0 : _a.name) || "Unknown Creator" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "px-3 py-1 bg-primary/10 text-primary rounded-full", children: currentItem.type }),
          /* @__PURE__ */ jsx("span", { children: currentItem.duration }),
          /* @__PURE__ */ jsxs("span", { children: [
            currentIndex + 1,
            " / ",
            items.length
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: toggleShuffle,
              className: `p-3 rounded-full transition-colors ${shuffle ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/20"}`,
              children: /* @__PURE__ */ jsx(Shuffle, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: playPrevious,
              className: "p-4 rounded-full bg-muted hover:bg-primary/20 transition-colors",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-6 h-6" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => playItem(currentIndex),
              className: "p-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-110 shadow-lg",
              children: /* @__PURE__ */ jsx(Play, { className: "w-8 h-8 fill-current ml-1" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: playNext,
              className: "p-4 rounded-full bg-muted hover:bg-primary/20 transition-colors",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-6 h-6" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: toggleRepeat,
              className: `p-3 rounded-full transition-colors ${repeat ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/20"}`,
              children: /* @__PURE__ */ jsx(Repeat, { className: "w-5 h-5" })
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Collection Playlist" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: items.map((item, index) => {
        var _a2;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => playItem(index),
            className: `w-full flex items-center gap-4 p-4 rounded-lg transition-all ${index === currentIndex ? "bg-primary/10 border-2 border-primary" : "bg-card hover:bg-muted border border-transparent"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-md overflow-hidden flex-shrink-0", children: /* @__PURE__ */ jsx(
                ImageLoader,
                {
                  src: item.thumbnail,
                  alt: item.title,
                  className: "w-full h-full object-cover"
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 text-left", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium line-clamp-1", children: item.title }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
                  ((_a2 = item.creator) == null ? void 0 : _a2.name) || "Unknown",
                  " • ",
                  item.duration
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: /* @__PURE__ */ jsx("span", { className: "px-2 py-1 bg-muted rounded-full text-xs", children: item.type }) })
            ]
          },
          item.id
        );
      }) })
    ] })
  ] }) });
}
export {
  CollectionPlayerPage
};
