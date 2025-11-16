import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Check, BookMarked, Headphones, BookOpen, FileText, Clock, Trash2, AlertCircle, Play } from "lucide-react";
import { u as useAuth, s as supabase } from "./server-build-CCRgnkMn.js";
import { useNavigate } from "react-router-dom";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function HistoryFilters({
  selectedPeriod,
  onPeriodChange,
  selectedTypes,
  onTypesChange
}) {
  const periods = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" }
  ];
  const types = [
    { id: "article", label: "Articles" },
    { id: "book", label: "Books" },
    { id: "audiobook", label: "Audiobooks" },
    { id: "podcast", label: "Podcasts" }
  ];
  const toggleType = (typeId) => {
    const newTypes = selectedTypes.includes(typeId) ? selectedTypes.filter((id) => id !== typeId) : [...selectedTypes, typeId];
    onTypesChange(newTypes);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: periods.map((period) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => onPeriodChange(period.id),
        className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === period.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`,
        children: period.label
      },
      period.id
    )) }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", children: types.map((type) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => toggleType(type.id),
        className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedTypes.includes(type.id) ? "bg-primary/10 text-primary" : "bg-muted hover:bg-primary/10"}`,
        children: [
          selectedTypes.includes(type.id) && /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }),
          type.label
        ]
      },
      type.id
    )) })
  ] });
}
function ContentTypeIcon({ type, className }) {
  switch (type) {
    case "article":
      return /* @__PURE__ */ jsx(FileText, { className });
    case "ebook":
    case "book":
      return /* @__PURE__ */ jsx(BookOpen, { className });
    case "audiobook":
    case "podcast":
      return /* @__PURE__ */ jsx(Headphones, { className });
    case "summary":
      return /* @__PURE__ */ jsx(BookMarked, { className });
    default:
      return null;
  }
}
function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyItems, setHistoryItems] = useState({});
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        let startDate = null;
        if (selectedPeriod === "today") {
          startDate = /* @__PURE__ */ new Date();
          startDate.setHours(0, 0, 0, 0);
        } else if (selectedPeriod === "week") {
          startDate = /* @__PURE__ */ new Date();
          startDate.setDate(startDate.getDate() - 7);
        } else if (selectedPeriod === "month") {
          startDate = /* @__PURE__ */ new Date();
          startDate.setMonth(startDate.getMonth() - 1);
        }
        let query = supabase.from("content_views").select("content_id, content_type, viewed_at").eq("viewer_id", user.id).order("viewed_at", { ascending: false });
        if (startDate) {
          query = query.gte("viewed_at", startDate.toISOString());
        }
        if (selectedTypes.length > 0) {
          query = query.in("content_type", selectedTypes);
        }
        const { data: viewsData, error: viewsError } = await query;
        if (viewsError) throw viewsError;
        const groupedViews = {};
        viewsData == null ? void 0 : viewsData.forEach((view) => {
          const date = new Date(view.viewed_at);
          let groupKey;
          const today = /* @__PURE__ */ new Date();
          const yesterday = /* @__PURE__ */ new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (date.toDateString() === today.toDateString()) {
            groupKey = "Today";
          } else if (date.toDateString() === yesterday.toDateString()) {
            groupKey = "Yesterday";
          } else if (date > new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)) {
            groupKey = "Last Week";
          } else if (date > new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())) {
            groupKey = "Last Month";
          } else {
            groupKey = "Older";
          }
          if (!groupedViews[groupKey]) {
            groupedViews[groupKey] = /* @__PURE__ */ new Map();
          }
          const contentKey = `${view.content_type}-${view.content_id}`;
          if (!groupedViews[groupKey].has(contentKey)) {
            groupedViews[groupKey].set(contentKey, {
              id: view.content_id,
              type: view.content_type
            });
          }
        });
        const contentDetails = {};
        const contentPromises = [];
        for (const [groupKey, contentMap] of Object.entries(groupedViews)) {
          for (const [contentKey, content] of contentMap.entries()) {
            const { id, type } = content;
            if (contentDetails[contentKey]) continue;
            const contentPromise = (async () => {
              try {
                let contentData, authorData;
                if (type === "article") {
                  const { data: article } = await supabase.from("articles").select("title, excerpt, cover_url, author_id, category, view_count, created_at").eq("id", id).single();
                  if (article) {
                    contentData = article;
                    const { data: author } = await supabase.from("profiles").select("id, name, username, avatar_url").eq("id", article.author_id).single();
                    authorData = author;
                  }
                } else if (type === "book") {
                  const { data: book } = await supabase.from("books").select("title, description, cover_url, author_id, category, view_count, created_at").eq("id", id).single();
                  if (book) {
                    contentData = book;
                    const { data: author } = await supabase.from("profiles").select("id, name, username, avatar_url").eq("id", book.author_id).single();
                    authorData = author;
                  }
                } else if (type === "audiobook") {
                  const { data: audiobook } = await supabase.from("audiobooks").select("title, description, cover_url, author_id, category, view_count, created_at").eq("id", id).single();
                  if (audiobook) {
                    contentData = audiobook;
                    const { data: author } = await supabase.from("profiles").select("id, name, username, avatar_url").eq("id", audiobook.author_id).single();
                    authorData = author;
                  }
                } else if (type === "podcast") {
                  const { data: podcast } = await supabase.from("podcast_episodes").select("title, description, cover_url, author_id, category, view_count, created_at, duration").eq("id", id).single();
                  if (podcast) {
                    contentData = podcast;
                    const { data: author } = await supabase.from("profiles").select("id, name, username, avatar_url").eq("id", podcast.author_id).single();
                    authorData = author;
                  }
                }
                if (contentData && authorData) {
                  const maybeWithDuration = contentData;
                  const resolvedDuration = typeof maybeWithDuration.duration === "string" ? maybeWithDuration.duration : type === "article" ? "5 min read" : "30 min";
                  contentDetails[contentKey] = {
                    id,
                    type,
                    title: contentData.title,
                    thumbnail: contentData.cover_url || `https://source.unsplash.com/random/800x600?${type}&sig=${id}`,
                    duration: resolvedDuration,
                    views: contentData.view_count || 0,
                    createdAt: contentData.created_at,
                    creator: {
                      id: authorData.id,
                      name: authorData.name || authorData.username || "Unknown Author",
                      avatar: authorData.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${authorData.id}`,
                      followers: 0
                    },
                    category: contentData.category,
                    // Calculate a deterministic progress value based on the content ID
                    progress: parseInt(id.substring(0, 8), 16) % 101
                    // 0-100 range
                  };
                }
              } catch (error2) {
                console.error(`Error fetching content details for ${type}-${id}:`, error2);
              }
            })();
            contentPromises.push(contentPromise);
          }
        }
        await Promise.all(contentPromises);
        const historyGroups = {};
        for (const [groupKey, contentMap] of Object.entries(groupedViews)) {
          historyGroups[groupKey] = Array.from(contentMap.values()).map((content) => {
            const contentKey = `${content.type}-${content.id}`;
            return contentDetails[contentKey];
          }).filter(Boolean);
        }
        setHistoryItems(historyGroups);
      } catch (error2) {
        console.error("Error loading history:", error2);
        setError("Failed to load history. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [user, selectedPeriod, selectedTypes]);
  const handleClearHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { error: error2 } = await supabase.from("content_views").delete().eq("viewer_id", user.id);
      if (error2) throw error2;
      setHistoryItems({});
      setShowClearConfirm(false);
    } catch (error2) {
      console.error("Error clearing history:", error2);
      setError("Failed to clear history. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (!user) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "Sign in to view your history" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Track your learning journey and revisit content" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Clock, { className: "w-6 h-6 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "History" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Track your learning journey and revisit content" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowClearConfirm(true),
          className: "flex items-center gap-2 px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors",
          children: [
            /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Clear History" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      HistoryFilters,
      {
        selectedPeriod,
        onPeriodChange: setSelectedPeriod,
        selectedTypes,
        onTypesChange: setSelectedTypes
      }
    ),
    error && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }),
      /* @__PURE__ */ jsx("p", { children: error })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "space-y-8", children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "h-6 bg-muted rounded w-32 animate-pulse" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: Array.from({ length: 2 }).map((_2, j) => /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-lg p-4 animate-pulse", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-40 h-24 bg-muted rounded" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
          /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/2" })
        ] })
      ] }) }, j)) })
    ] }, i)) }) : Object.keys(historyItems).length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-8", children: Object.entries(historyItems).map(([date, items]) => /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: date }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: items.map((item) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer",
          onClick: () => {
            switch (item.type) {
              case "article":
                navigate(`/reader/article-${item.id}`);
                break;
              case "book":
                navigate(`/reader/book-${item.id}`);
                break;
              case "audiobook":
              case "podcast":
                navigate(`/player/${item.type}-${item.id}`);
                break;
            }
          },
          children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative flex-shrink-0", children: [
              /* @__PURE__ */ jsx("div", { className: "w-40 h-24 rounded-md overflow-hidden", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.thumbnail,
                  alt: item.title,
                  className: "w-full h-full object-cover",
                  onError: (e) => {
                    const img = e.target;
                    img.src = `https://source.unsplash.com/random/400x240?${item.type}&sig=${item.id}`;
                  }
                }
              ) }),
              item.progress !== void 0 && item.progress > 0 && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 h-1 bg-background/50", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-full bg-primary transition-all",
                  style: { width: `${item.progress}%` }
                }
              ) }),
              (item.type === "audiobook" || item.type === "podcast") && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors", children: /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(Play, { className: "w-5 h-5 text-primary-foreground ml-1" }) }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-medium line-clamp-1 hover:text-primary transition-colors", children: item.title }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1 text-sm text-muted-foreground", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(ContentTypeIcon, { type: item.type, className: "w-4 h-4" }),
                      /* @__PURE__ */ jsx("span", { className: "capitalize", children: item.type })
                    ] }),
                    /* @__PURE__ */ jsx("span", { children: "•" }),
                    /* @__PURE__ */ jsx("span", { children: item.creator.name })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-sm text-muted-foreground", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
                  /* @__PURE__ */ jsx("span", { children: item.duration })
                ] })
              ] }),
              item.progress !== void 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm text-muted-foreground", children: item.progress === 100 ? /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Completed" }) : /* @__PURE__ */ jsxs("span", { children: [
                Math.round(item.progress),
                "% complete"
              ] }) })
            ] })
          ] })
        },
        `${item.type}-${item.id}`
      )) })
    ] }, date)) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "No history found" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: selectedTypes.length > 0 || selectedPeriod !== "all" ? "Try selecting different content types or time period" : "Start exploring content to build your history" })
    ] }),
    showClearConfirm && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
        onClick: () => setShowClearConfirm(false),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-background rounded-lg p-6 max-w-md mx-4 text-center space-y-4",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Clear History" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Are you sure you want to clear your entire history? This action cannot be undone." }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4 pt-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowClearConfirm(false),
                    className: "px-4 py-2 rounded-lg border hover:bg-accent transition-colors",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleClearHistory,
                    className: "px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors",
                    children: "Clear History"
                  }
                )
              ] })
            ]
          }
        )
      }
    )
  ] });
}
export {
  HistoryPage
};
