import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { X, Search, Filter, BookOpen, Headphones, AlertCircle, Check, Clock, Star, Calendar, Plus, Play, MoreHorizontal, Eye, Pause, CheckCircle, Target } from "lucide-react";
import { u as useAuth, s as supabase } from "./server-build-CCRgnkMn.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import { I as Input } from "./input-UQRBPDAP.js";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function ReadingStatusDialog({
  onClose,
  onAddToStatus,
  defaultStatus = "want_to_consume",
  title = "Add to Library"
}) {
  var _a, _b;
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [addingItems, setAddingItems] = useState(false);
  const [error, setError] = useState(null);
  const [contentFilter, setContentFilter] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
  const statusOptions = [
    { value: "want_to_consume", label: "Want to Experience", description: "Content you plan to read or listen to" },
    { value: "consuming", label: "Currently Experiencing", description: "Content you are actively reading or listening to" },
    { value: "completed", label: "Experienced", description: "Content you have finished" },
    { value: "paused", label: "Paused", description: "Content you have temporarily stopped" },
    { value: "dropped", label: "Dropped", description: "Content you decided not to finish" }
  ];
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const [booksResult, audiobooksResult, articlesResult, podcastsResult] = await Promise.all([
          supabase.from("books").select("id, title, description, cover_url, author_id, created_at, status, category").eq("status", "published").order("created_at", { ascending: false }),
          supabase.from("audiobooks").select("id, title, description, cover_url, author_id, narrator, created_at, status, category").eq("status", "published").order("created_at", { ascending: false }),
          supabase.from("articles").select("id, title, excerpt, cover_url, author_id, created_at, status, category").eq("status", "published").order("created_at", { ascending: false }),
          supabase.from("podcast_episodes").select("id, title, description, cover_url, author_id, duration, created_at, status, category").eq("status", "published").order("created_at", { ascending: false })
        ]);
        const booksWithAuthors = await Promise.all((booksResult.data || []).map(async (book) => {
          const { data: authorData } = await supabase.from("profiles").select("name, username").eq("id", book.author_id).single();
          return {
            id: book.id,
            title: book.title,
            author: (authorData == null ? void 0 : authorData.name) || (authorData == null ? void 0 : authorData.username) || "Unknown Author",
            cover: book.cover_url || `https://source.unsplash.com/random/400x600?book&sig=${book.id}`,
            rating: 4.5,
            year: new Date(book.created_at).getFullYear(),
            type: "book",
            description: book.description
          };
        }));
        const audiobooksWithAuthors = await Promise.all((audiobooksResult.data || []).map(async (audiobook) => {
          const { data: authorData } = await supabase.from("profiles").select("name, username").eq("id", audiobook.author_id).single();
          return {
            id: audiobook.id,
            title: audiobook.title,
            author: (authorData == null ? void 0 : authorData.name) || (authorData == null ? void 0 : authorData.username) || "Unknown Author",
            cover: audiobook.cover_url || `https://source.unsplash.com/random/400x600?audiobook&sig=${audiobook.id}`,
            rating: 4.5,
            year: new Date(audiobook.created_at).getFullYear(),
            type: "audiobook",
            description: audiobook.description,
            duration: "2-4 hours"
          };
        }));
        const articlesWithAuthors = await Promise.all((articlesResult.data || []).map(async (article) => {
          const { data: authorData } = await supabase.from("profiles").select("name, username").eq("id", article.author_id).single();
          return {
            id: article.id,
            title: article.title,
            author: (authorData == null ? void 0 : authorData.name) || (authorData == null ? void 0 : authorData.username) || "Unknown Author",
            cover: article.cover_url || `https://source.unsplash.com/random/400x600?article&sig=${article.id}`,
            rating: 4.5,
            year: new Date(article.created_at).getFullYear(),
            type: "article",
            description: article.excerpt,
            duration: "5-10 min read"
          };
        }));
        const podcastsWithAuthors = await Promise.all((podcastsResult.data || []).map(async (podcast) => {
          const { data: authorData } = await supabase.from("profiles").select("name, username").eq("id", podcast.author_id).single();
          return {
            id: podcast.id,
            title: podcast.title,
            author: (authorData == null ? void 0 : authorData.name) || (authorData == null ? void 0 : authorData.username) || "Unknown Author",
            cover: podcast.cover_url || `https://source.unsplash.com/random/400x600?podcast&sig=${podcast.id}`,
            rating: 4.5,
            year: new Date(podcast.created_at).getFullYear(),
            type: "podcast",
            description: podcast.description,
            duration: podcast.duration || "30-60 min"
          };
        }));
        let allContent = [...booksWithAuthors, ...audiobooksWithAuthors, ...articlesWithAuthors, ...podcastsWithAuthors];
        if (contentFilter !== "all") {
          allContent = allContent.filter((item) => item.type === contentFilter);
        }
        setContent(allContent);
      } catch (error2) {
        console.error("Error loading content:", error2);
        setError("Failed to load content. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [contentFilter]);
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setContentFilter("all");
      return;
    }
    setLoading(true);
    try {
      const searchResults = content.filter(
        (item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setContent(searchResults);
    } catch (error2) {
      console.error("Error searching content:", error2);
      setError("Failed to search content. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  const toggleItemSelection = (item) => {
    if (selectedItems.some((i) => i.id === item.id && i.type === item.type)) {
      setSelectedItems(selectedItems.filter((i) => !(i.id === item.id && i.type === item.type)));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };
  const handleAddToStatus = async () => {
    if (selectedItems.length === 0 || !user) return;
    setAddingItems(true);
    setError(null);
    try {
      for (const item of selectedItems) {
        await onAddToStatus(item, selectedStatus);
      }
      onClose();
    } catch (error2) {
      console.error("Error adding items to status:", error2);
      setError("Failed to add items. Please try again.");
    } finally {
      setAddingItems(false);
    }
  };
  const filteredContent = contentFilter === "all" ? content : content.filter((item) => item.type === contentFilter);
  const getContentIcon = (type) => {
    switch (type) {
      case "audiobook":
        return /* @__PURE__ */ jsx(Headphones, { className: "w-3 h-3" });
      case "podcast":
        return /* @__PURE__ */ jsx(Headphones, { className: "w-3 h-3" });
      case "article":
        return /* @__PURE__ */ jsx(BookOpen, { className: "w-3 h-3" });
      default:
        return /* @__PURE__ */ jsx(BookOpen, { className: "w-3 h-3" });
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-background rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: title }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  className: "p-2 hover:bg-accent rounded-full transition-colors",
                  children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "p-4 border-b", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Add to:" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: selectedStatus,
                  onChange: (e) => setSelectedStatus(e.target.value),
                  className: "w-full h-10 rounded-md border border-input bg-background px-3 text-sm",
                  children: statusOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: (_a = statusOptions.find((opt) => opt.value === selectedStatus)) == null ? void 0 : _a.description })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "p-4 border-b", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
                /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                    onKeyPress: handleKeyPress,
                    placeholder: "Search by title or author...",
                    className: "pl-9 pr-4"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleSearch,
                    className: "absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors",
                    children: "Search"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 text-muted-foreground" }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setContentFilter("all"),
                      className: `px-3 py-1.5 text-sm rounded-lg transition-colors ${contentFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`,
                      children: "All"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setContentFilter("book"),
                      className: `px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${contentFilter === "book" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`,
                      children: [
                        /* @__PURE__ */ jsx(BookOpen, { className: "w-3 h-3" }),
                        "Books"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setContentFilter("audiobook"),
                      className: `px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${contentFilter === "audiobook" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`,
                      children: [
                        /* @__PURE__ */ jsx(Headphones, { className: "w-3 h-3" }),
                        "Audiobooks"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setContentFilter("article"),
                      className: `px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${contentFilter === "article" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`,
                      children: [
                        /* @__PURE__ */ jsx(BookOpen, { className: "w-3 h-3" }),
                        "Articles"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setContentFilter("podcast"),
                      className: `px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${contentFilter === "podcast" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`,
                      children: [
                        /* @__PURE__ */ jsx(Headphones, { className: "w-3 h-3" }),
                        "Podcasts"
                      ]
                    }
                  )
                ] })
              ] })
            ] }) }),
            error && /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 bg-destructive/10 text-destructive flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm", children: error })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-4", children: loading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "animate-pulse", children: [
              /* @__PURE__ */ jsx("div", { className: "aspect-[2/3] bg-muted rounded-lg mb-2" }),
              /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4 mb-1" }),
              /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/2" })
            ] }, i)) }) : filteredContent.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", children: filteredContent.map((item) => {
              const isSelected = selectedItems.some((i) => i.id === item.id && i.type === item.type);
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  onClick: () => toggleItemSelection(item),
                  className: `cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary scale-105" : "hover:scale-105"}`,
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "aspect-[2/3] rounded-lg overflow-hidden bg-muted relative", children: [
                      /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: item.cover,
                          alt: item.title,
                          className: "w-full h-full object-cover"
                        }
                      ),
                      isSelected && /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-white" }) }),
                      /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 px-2 py-1 rounded-full bg-background/80 text-xs font-medium flex items-center gap-1", children: [
                        getContentIcon(item.type),
                        /* @__PURE__ */ jsx("span", { className: "capitalize", children: item.type })
                      ] }),
                      (item.type === "audiobook" || item.type === "podcast") && item.duration && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/60 text-white text-xs flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }),
                        /* @__PURE__ */ jsx("span", { children: item.duration })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("h3", { className: "mt-2 font-medium text-sm line-clamp-2", children: item.title }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground mt-1", children: [
                      /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: item.author }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
                        /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 fill-yellow-500 text-yellow-500" }),
                        /* @__PURE__ */ jsx("span", { children: item.rating })
                      ] })
                    ] })
                  ]
                },
                `${item.type}-${item.id}`
              );
            }) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
              /* @__PURE__ */ jsx(BookOpen, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }),
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "No content found" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Try searching with different keywords or changing the content filter" })
            ] }) }),
            selectedItems.length > 0 && /* @__PURE__ */ jsx("div", { className: "px-4 py-2 bg-primary/10 border-t border-b", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-primary", children: [
              selectedItems.length,
              " ",
              selectedItems.length === 1 ? "item" : "items",
              " selected"
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 border-t flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { children: "Add to your library" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: onClose,
                    className: "px-4 py-2 text-sm rounded-lg border hover:bg-accent transition-colors",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleAddToStatus,
                    disabled: selectedItems.length === 0 || addingItems,
                    className: "px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2",
                    children: addingItems ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" }),
                      "Adding..."
                    ] }) : `Add ${selectedItems.length ? selectedItems.length : ""} to ${(_b = statusOptions.find((opt) => opt.value === selectedStatus)) == null ? void 0 : _b.label}`
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function LibraryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("want_to_consume");
  const [searchQuery, setSearchQuery] = useState("");
  const [contentFilter, setContentFilter] = useState("all");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusDialogConfig, setStatusDialogConfig] = useState({ status: "want_to_consume", title: "Add to Library" });
  const [readingStatusItems, setReadingStatusItems] = useState({
    want_to_consume: [],
    consuming: [],
    completed: [],
    paused: [],
    dropped: []
  });
  useEffect(() => {
    const openLearningGoals = searchParams.get("openLearningGoals");
    if (openLearningGoals === "true") {
      setStatusDialogConfig({
        status: "want_to_consume",
        title: "Add to Learning Goals"
      });
      setShowStatusDialog(true);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("openLearningGoals");
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${newSearchParams.toString()}`
      );
    }
  }, [searchParams]);
  const loadLibrary = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data: statusData, error: statusError } = await supabase.from("reading_status").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
      if (statusError) throw statusError;
      console.log(`Found ${(statusData == null ? void 0 : statusData.length) || 0} reading status items`);
      const statusItems = [];
      const processedItems = /* @__PURE__ */ new Set();
      const statusBatches = chunk(statusData || [], 10);
      for (const batch of statusBatches) {
        const batchPromises = batch.map(async (statusItem) => {
          try {
            const itemKey = `${statusItem.content_type}-${statusItem.content_id}`;
            if (processedItems.has(itemKey)) {
              return;
            }
            processedItems.add(itemKey);
            let contentData;
            let authorData;
            if (statusItem.content_type === "book") {
              const { data: book } = await supabase.from("books").select("title, description, cover_url, author_id, category, view_count, created_at").eq("id", statusItem.content_id).single();
              if (book) {
                contentData = book;
                const { data: author } = await supabase.from("profiles").select("id, name, username, avatar_url").eq("id", book.author_id).single();
                authorData = author;
              }
            } else if (statusItem.content_type === "audiobook") {
              const { data: audiobook } = await supabase.from("audiobooks").select("title, description, cover_url, author_id, category, view_count, created_at").eq("id", statusItem.content_id).single();
              if (audiobook) {
                contentData = audiobook;
                const { data: author } = await supabase.from("profiles").select("id, name, username, avatar_url").eq("id", audiobook.author_id).single();
                authorData = author;
              }
            } else if (statusItem.content_type === "article") {
              const { data: article } = await supabase.from("articles").select("title, excerpt, cover_url, author_id, category, view_count, created_at").eq("id", statusItem.content_id).single();
              if (article) {
                contentData = article;
                const { data: author } = await supabase.from("profiles").select("id, name, username, avatar_url").eq("id", article.author_id).single();
                authorData = author;
              }
            } else if (statusItem.content_type === "podcast") {
              const { data: podcast } = await supabase.from("podcast_episodes").select("title, description, cover_url, author_id, category, view_count, created_at, duration").eq("id", statusItem.content_id).single();
              if (podcast) {
                contentData = podcast;
                const { data: author } = await supabase.from("profiles").select("id, name, username, avatar_url").eq("id", podcast.author_id).single();
                authorData = author;
              }
            }
            if (contentData && authorData) {
              const maybeWithDuration = contentData;
              const resolvedDuration = typeof maybeWithDuration.duration === "string" ? maybeWithDuration.duration : statusItem.content_type === "article" ? "5 min read" : "30 min";
              statusItems.push({
                id: statusItem.content_id,
                type: statusItem.content_type,
                title: contentData.title,
                thumbnail: contentData.cover_url || `https://source.unsplash.com/random/800x600?${statusItem.content_type}&sig=${statusItem.content_id}`,
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
                status: statusItem.status,
                progress: statusItem.progress ?? 0,
                started_at: statusItem.started_at,
                completed_at: statusItem.completed_at,
                reading_status_id: statusItem.id
              });
            }
          } catch (error2) {
            console.error(`Error processing status item ${statusItem.content_id}:`, error2);
          }
        });
        await Promise.all(batchPromises);
      }
      const groupedItems = {
        want_to_consume: statusItems.filter((item) => item.status === "want_to_consume"),
        consuming: statusItems.filter((item) => item.status === "consuming"),
        completed: statusItems.filter((item) => item.status === "completed"),
        paused: statusItems.filter((item) => item.status === "paused"),
        dropped: statusItems.filter((item) => item.status === "dropped")
      };
      setReadingStatusItems(groupedItems);
    } catch (err) {
      console.error("Error loading library:", err);
      setError(err instanceof Error ? err.message : "Failed to load library");
    } finally {
      setLoading(false);
    }
  };
  function chunk(array, size) {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  }
  useEffect(() => {
    loadLibrary();
  }, [user]);
  const handleAddToStatus = async (item, status) => {
    if (!user) return;
    try {
      const { error: error2 } = await supabase.from("reading_status").upsert({
        user_id: user.id,
        content_id: item.id,
        content_type: item.type,
        status,
        progress: status === "completed" ? 100 : 0,
        started_at: status === "consuming" ? (/* @__PURE__ */ new Date()).toISOString() : null,
        completed_at: status === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : null
      });
      if (error2) throw error2;
      loadLibrary();
    } catch (error2) {
      console.error("Error adding to status:", error2);
    }
  };
  const handleStatusChange = async (item, newStatus) => {
    if (!user) return;
    try {
      const updateData = {
        status: newStatus,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (newStatus === "consuming" && item.status === "want_to_consume") {
        updateData.started_at = (/* @__PURE__ */ new Date()).toISOString();
      }
      if (newStatus === "completed") {
        updateData.completed_at = (/* @__PURE__ */ new Date()).toISOString();
        updateData.progress = 100;
      }
      const { error: error2 } = await supabase.from("reading_status").update(updateData).eq("id", item.reading_status_id);
      if (error2) throw error2;
      setReadingStatusItems((prev) => {
        const newItems = { ...prev };
        Object.keys(newItems).forEach((status) => {
          newItems[status] = newItems[status].filter(
            (i) => i.reading_status_id !== item.reading_status_id
          );
        });
        const updatedItem = { ...item, status: newStatus, progress: newStatus === "completed" ? 100 : item.progress };
        newItems[newStatus].push(updatedItem);
        return newItems;
      });
    } catch (error2) {
      console.error("Error updating status:", error2);
    }
  };
  const handleRemoveFromStatus = async (item) => {
    if (!user) return;
    try {
      const { error: error2 } = await supabase.from("reading_status").delete().eq("id", item.reading_status_id);
      if (error2) throw error2;
      setReadingStatusItems((prev) => ({
        ...prev,
        [item.status]: prev[item.status].filter(
          (i) => i.reading_status_id !== item.reading_status_id
        )
      }));
    } catch (error2) {
      console.error("Error removing from status:", error2);
    }
  };
  const handleContentClick = (item) => {
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
  };
  const getStatusLabel = (status) => {
    switch (status) {
      case "want_to_consume":
        return "Want to Experience";
      case "consuming":
        return "Currently Experiencing";
      case "completed":
        return "Experienced";
      case "paused":
        return "Paused";
      case "dropped":
        return "Dropped";
      default:
        return status;
    }
  };
  const getStatusDescription = (status) => {
    switch (status) {
      case "want_to_consume":
        return "Content you plan to read or listen to";
      case "consuming":
        return "Content you are actively reading or listening to";
      case "completed":
        return "Content you have finished";
      case "paused":
        return "Content you have temporarily stopped";
      case "dropped":
        return "Content you decided not to finish";
      default:
        return "";
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "want_to_consume":
        return /* @__PURE__ */ jsx(Target, { className: "w-6 h-6 text-primary" });
      case "consuming":
        return /* @__PURE__ */ jsx(Play, { className: "w-6 h-6 text-primary" });
      case "completed":
        return /* @__PURE__ */ jsx(CheckCircle, { className: "w-6 h-6 text-primary" });
      case "paused":
        return /* @__PURE__ */ jsx(Pause, { className: "w-6 h-6 text-primary" });
      case "dropped":
        return /* @__PURE__ */ jsx(Eye, { className: "w-6 h-6 text-primary" });
      default:
        return /* @__PURE__ */ jsx(BookOpen, { className: "w-6 h-6 text-primary" });
    }
  };
  const getContentIcon = (type) => {
    switch (type) {
      case "audiobook":
      case "podcast":
        return /* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4" });
      default:
        return /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4" });
    }
  };
  const getFilteredItems = (items) => {
    let filtered = items;
    if (contentFilter !== "all") {
      filtered = filtered.filter((item) => item.type === contentFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.creator.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };
  const tabs = [
    { id: "want_to_consume", label: "Want to Experience", count: readingStatusItems.want_to_consume.length },
    { id: "consuming", label: "Currently Experiencing", count: readingStatusItems.consuming.length },
    { id: "completed", label: "Experienced", count: readingStatusItems.completed.length },
    { id: "paused", label: "Paused", count: readingStatusItems.paused.length },
    { id: "dropped", label: "Dropped", count: readingStatusItems.dropped.length }
  ];
  if (!user) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "Sign in to access your library" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Keep track of your reading progress and organize your content" })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "text-destructive mb-4 mt-2", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => loadLibrary(),
          className: "text-primary hover:underline",
          children: "Try again"
        }
      )
    ] });
  }
  const currentItems = getFilteredItems(readingStatusItems[activeTab]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 overflow-x-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "My Library" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setStatusDialogConfig({
                status: "want_to_consume",
                title: "Add to Library"
              });
              setShowStatusDialog(true);
            },
            className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: "Add Content" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Track your learning journey across all content types" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-b", children: /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx("div", { className: "flex gap-2 overflow-x-auto scrollbar-hide pb-2", children: tabs.map((tab) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setActiveTab(tab.id),
        className: `flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
        children: [
          /* @__PURE__ */ jsx("span", { children: tab.label }),
          /* @__PURE__ */ jsx("span", { className: "bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs", children: tab.count })
        ]
      },
      tab.id
    )) }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search your library...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "w-full h-10 pl-9 pr-4 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2", children: [
        /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 whitespace-nowrap", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setContentFilter("all"),
              className: `px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap ${contentFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`,
              children: "All"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setContentFilter("book"),
              className: `px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${contentFilter === "book" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`,
              children: [
                /* @__PURE__ */ jsx(BookOpen, { className: "w-3 h-3" }),
                "Books"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setContentFilter("audiobook"),
              className: `px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${contentFilter === "audiobook" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`,
              children: [
                /* @__PURE__ */ jsx(Headphones, { className: "w-3 h-3" }),
                "Audiobooks"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setContentFilter("article"),
              className: `px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${contentFilter === "article" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`,
              children: [
                /* @__PURE__ */ jsx(BookOpen, { className: "w-3 h-3" }),
                "Articles"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setContentFilter("podcast"),
              className: `px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${contentFilter === "podcast" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`,
              children: [
                /* @__PURE__ */ jsx(Headphones, { className: "w-3 h-3" }),
                "Podcasts"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center", children: getStatusIcon(activeTab) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: getStatusLabel(activeTab) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: getStatusDescription(activeTab) })
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "animate-pulse", children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-[2/3] bg-muted rounded-lg mb-2" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4 mb-1" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/2" })
      ] }, i)) }) : currentItems.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4", children: currentItems.map((item) => /* @__PURE__ */ jsxs("div", { className: "group space-y-3", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => handleContentClick(item),
            className: "cursor-pointer relative aspect-[2/3] rounded-lg overflow-hidden bg-muted",
            children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.thumbnail,
                  alt: item.title,
                  className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
                  onError: (e) => {
                    const img = e.target;
                    img.src = `https://source.unsplash.com/random/400x600?${item.type}&sig=${item.id}`;
                  }
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 px-2 py-1 rounded-full bg-background/90 text-xs font-medium flex items-center gap-1 shadow-sm", children: [
                getContentIcon(item.type),
                /* @__PURE__ */ jsx("span", { className: "capitalize hidden sm:inline", children: item.type })
              ] }),
              item.progress > 0 && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 h-1 bg-background/50", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-full bg-primary transition-all",
                  style: { width: `${item.progress}%` }
                }
              ) }),
              (item.type === "audiobook" || item.type === "podcast") && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors", children: /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(Play, { className: "w-6 h-6 text-primary-foreground ml-1" }) }) }),
              /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-[100]", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => e.stopPropagation(),
                    className: "w-8 h-8 rounded-full bg-background/95 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow-lg border",
                    children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-full mt-2 w-48 bg-background border rounded-lg shadow-xl z-[200] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto transform scale-95 group-hover:scale-100", children: /* @__PURE__ */ jsxs("div", { className: "p-2 space-y-1", children: [
                  ["want_to_consume", "consuming", "completed", "paused", "dropped"].map((status) => /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        handleStatusChange(item, status);
                      },
                      className: `w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${item.status === status ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground"}`,
                      children: getStatusLabel(status)
                    },
                    status
                  )),
                  /* @__PURE__ */ jsx("div", { className: "border-t pt-1 mt-1", children: /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        handleRemoveFromStatus(item);
                      },
                      className: "w-full text-left px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 transition-colors",
                      children: "Remove from Library"
                    }
                  ) })
                ] }) })
              ] }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium line-clamp-2 text-sm group-hover:text-primary transition-colors", children: item.title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-1", children: item.creator.name }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 fill-yellow-500 text-yellow-500" }),
              /* @__PURE__ */ jsx("span", { children: "4.5" })
            ] }),
            item.progress > 0 && /* @__PURE__ */ jsxs("span", { children: [
              item.progress,
              "% complete"
            ] })
          ] })
        ] })
      ] }, `${item.type}-${item.id}`)) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4", children: getStatusIcon(activeTab) }),
        /* @__PURE__ */ jsxs("h3", { className: "text-lg font-medium mb-2", children: [
          "No content in ",
          getStatusLabel(activeTab).toLowerCase()
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: getStatusDescription(activeTab) }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setStatusDialogConfig({
                status: activeTab,
                title: `Add to ${getStatusLabel(activeTab)}`
              });
              setShowStatusDialog(true);
            },
            className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Add Content"
            ]
          }
        )
      ] })
    ] }) }),
    showStatusDialog && /* @__PURE__ */ jsx(
      ReadingStatusDialog,
      {
        onClose: () => setShowStatusDialog(false),
        onAddToStatus: handleAddToStatus,
        defaultStatus: statusDialogConfig.status,
        title: statusDialogConfig.title
      }
    )
  ] });
}
export {
  LibraryPage
};
