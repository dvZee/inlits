import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { u as useAuth, s as supabase, g as getTextLanguageClass } from "./server-build-B2NqiNl4.js";
import { FileText, BookOpen, Headphones, Mic, BookMarked, Search, Star, Edit, Eye, Trash2, Plus } from "lucide-react";
import { I as Input } from "./input-BlbeFG63.js";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function ContentPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState([]);
  const [series, setSeries] = useState([]);
  const loadingRef = useRef(false);
  const retryCountRef = useRef(0);
  const getTableName = (tab) => {
    switch (tab) {
      case "articles":
        return "articles";
      case "books":
        return "books";
      case "audiobooks":
        return "audiobooks";
      case "podcasts":
        return "podcast_episodes";
      case "all":
        return "all";
      case "series":
        return "series";
      default:
        return "articles";
    }
  };
  const loadContent = useCallback(async () => {
    if (!profile || loadingRef.current) return;
    try {
      setLoading(true);
      loadingRef.current = true;
      setError(null);
      const loadContentType = async (table) => {
        try {
          const { data, error: error2 } = await supabase.from(table).select("*").eq("author_id", profile.id).order("created_at", { ascending: sortOrder === "oldest" });
          if (error2) throw error2;
          const typeMap = {
            "articles": "article",
            "books": "book",
            "audiobooks": "audiobook",
            "podcast_episodes": "podcast"
          };
          return (data || []).map((item) => ({
            ...item,
            type: typeMap[table]
          }));
        } catch (err) {
          console.error(`Error loading ${table}:`, err);
          return [];
        }
      };
      let contentData = [];
      if (activeTab === "all") {
        const results = await Promise.all([
          loadContentType("articles"),
          loadContentType("books"),
          loadContentType("audiobooks"),
          loadContentType("podcast_episodes")
        ]);
        contentData = results.flat();
      } else if (activeTab === "series") {
        const { data: seriesData, error: seriesError } = await supabase.from("series").select("*").eq("author_id", profile.id).order("created_at", { ascending: false });
        if (seriesError) throw seriesError;
        setSeries(seriesData || []);
      } else {
        const table = getTableName(activeTab);
        if (table !== "all" && table !== "series") {
          contentData = await loadContentType(table);
        }
      }
      contentData = contentData.filter((item) => {
        if (statusFilter !== "all" && item.status !== statusFilter) {
          return false;
        }
        if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      });
      contentData.sort((a, b) => {
        if (sortOrder === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setContent(contentData);
      retryCountRef.current = 0;
    } catch (error2) {
      console.error("Error loading content:", error2);
      setError("Failed to load content. Please try again.");
      if (retryCountRef.current < 3) {
        retryCountRef.current++;
        setTimeout(() => {
          loadContent();
        }, 2e3);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [profile == null ? void 0 : profile.id, activeTab, statusFilter, sortOrder, searchQuery]);
  useEffect(() => {
    loadContent();
  }, [loadContent]);
  const handleEdit = async (item) => {
    try {
      let table;
      let query;
      switch (item.type) {
        case "article":
          table = "articles";
          query = supabase.from(table).select(`
              *,
              series:series_id (
                id,
                title,
                description
              )
            `);
          break;
        case "book":
          table = "books";
          query = supabase.from(table).select(`
              *,
              series:series_id (
                id,
                title,
                description
              )
            `);
          break;
        case "audiobook":
          table = "audiobooks";
          query = supabase.from(table).select(`
              *,
              chapters:audiobook_chapters (
                id,
                title,
                audio_url,
                duration,
                "order"
              )
            `);
          break;
        case "podcast":
          table = "podcast_episodes";
          query = supabase.from(table).select("*");
          break;
        default:
          throw new Error("Invalid content type");
      }
      const { data, error: error2 } = await query.eq("id", item.id).eq("author_id", profile == null ? void 0 : profile.id).single();
      if (error2) throw error2;
      if (!data) throw new Error("Content not found");
      const editData = {
        ...item,
        ...data,
        type: item.type,
        content: data.content || "",
        excerpt: data.excerpt || data.description || "",
        description: data.description || "",
        cover_url: data.cover_url || "",
        series_id: data.series_id || null,
        featured: data.featured || false,
        price: data.price || 0,
        narrator: data.narrator || "",
        duration: data.duration || "",
        audio_url: data.audio_url || "",
        chapters: data.chapters || []
      };
      const basePath = `/dashboard/${profile == null ? void 0 : profile.username}/content/new`;
      navigate(`${basePath}/${item.type}`, {
        state: {
          editMode: true,
          item: editData
        }
      });
    } catch (error2) {
      console.error("Error fetching content for edit:", error2);
      alert("Failed to load content for editing. Please try again.");
    }
  };
  const handleDelete = async (item) => {
    if (!confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
      return;
    }
    try {
      let table;
      switch (item.type) {
        case "article":
          table = "articles";
          break;
        case "book":
          table = "books";
          break;
        case "audiobook":
          table = "audiobooks";
          break;
        case "podcast":
          table = "podcast_episodes";
          break;
      }
      const { error: error2 } = await supabase.from(table).delete().eq("id", item.id).eq("author_id", profile == null ? void 0 : profile.id);
      if (error2) throw error2;
      setContent((prev) => prev.filter((c) => c.id !== item.id));
      alert("Content deleted successfully");
    } catch (error2) {
      console.error("Error deleting content:", error2);
      alert("Failed to delete content. Please try again.");
    }
  };
  const handlePreview = (item) => {
    switch (item.type) {
      case "article":
        window.open(`/reader/article-${item.id}`, "_blank");
        break;
      case "book":
        window.open(`/reader/book-${item.id}`, "_blank");
        break;
      case "audiobook":
        window.open(`/player/audiobook-${item.id}`, "_blank");
        break;
      case "podcast":
        window.open(`/player/podcast-${item.id}`, "_blank");
        break;
    }
  };
  const handleToggleFeature = async (item) => {
    if (!profile) return;
    try {
      let table;
      switch (item.type) {
        case "article":
          table = "articles";
          break;
        case "book":
          table = "books";
          break;
        case "audiobook":
          table = "audiobooks";
          break;
        case "podcast":
          table = "podcast_episodes";
          break;
        default:
          throw new Error("Invalid content type");
      }
      setContent((prev) => prev.map(
        (c) => c.id === item.id ? { ...c, featured: !c.featured } : c
      ));
      const { error: error2 } = await supabase.from(table).update({
        featured: !item.featured,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", item.id).eq("author_id", profile.id);
      if (error2) {
        setContent((prev) => prev.map(
          (c) => c.id === item.id ? { ...c, featured: item.featured } : c
        ));
        throw error2;
      }
    } catch (error2) {
      console.error("Error toggling feature status:", error2);
      alert("Failed to update feature status. Please try again.");
    }
  };
  const getContentIcon = (type) => {
    switch (type) {
      case "article":
        return /* @__PURE__ */ jsx(FileText, { className: "w-6 h-6 text-primary" });
      case "book":
        return /* @__PURE__ */ jsx(BookOpen, { className: "w-6 h-6 text-primary" });
      case "audiobook":
        return /* @__PURE__ */ jsx(Headphones, { className: "w-6 h-6 text-primary" });
      case "podcast":
        return /* @__PURE__ */ jsx(Mic, { className: "w-6 h-6 text-primary" });
      default:
        return /* @__PURE__ */ jsx(FileText, { className: "w-6 h-6 text-primary" });
    }
  };
  const renderThumbnail = (item) => {
    if (item.cover_url) {
      return /* @__PURE__ */ jsx(
        "img",
        {
          src: item.cover_url,
          alt: item.title,
          className: "w-full h-full object-cover",
          onError: (e) => {
            e.currentTarget.src = `https://source.unsplash.com/random/800x600?${item.type}&sig=${item.id}`;
          }
        }
      );
    }
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full h-full bg-primary/10", children: getContentIcon(item.type) });
  };
  if (loading && !content.length) {
    return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "h-24 rounded-lg bg-muted animate-pulse" }, i)) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 border-b", children: [
      { id: "all", label: "All", icon: FileText },
      { id: "articles", label: "Articles", icon: FileText },
      { id: "books", label: "Books", icon: BookOpen },
      { id: "audiobooks", label: "Audiobooks", icon: Headphones },
      { id: "podcasts", label: "Podcasts", icon: Mic },
      { id: "series", label: "Series", icon: BookMarked }
    ].map((tab) => {
      const Icon = tab.icon;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab(tab.id),
          className: `flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
            tab.label
          ]
        },
        tab.id
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "search",
            placeholder: "Search content...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "pl-9"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: statusFilter,
          onChange: (e) => setStatusFilter(e.target.value),
          className: "h-10 px-3 py-2 text-sm border rounded-md bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          children: [
            /* @__PURE__ */ jsx("option", { value: "all", children: "All Status" }),
            /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
            /* @__PURE__ */ jsx("option", { value: "published", children: "Published" }),
            /* @__PURE__ */ jsx("option", { value: "archived", children: "Archived" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: sortOrder,
          onChange: (e) => setSortOrder(e.target.value),
          className: "h-10 px-3 py-2 text-sm border rounded-md bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          children: [
            /* @__PURE__ */ jsx("option", { value: "newest", children: "Newest First" }),
            /* @__PURE__ */ jsx("option", { value: "oldest", children: "Oldest First" })
          ]
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 text-sm text-destructive rounded-lg bg-destructive/10", children: [
      error,
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => loadContent(),
          className: "ml-2 underline hover:no-underline",
          children: "Try again"
        }
      )
    ] }),
    activeTab === "series" ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: series.map((s) => /* @__PURE__ */ jsx("div", { className: "aspect-[4/3] bg-card border rounded-lg p-6 hover:border-primary/50 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: s.title }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground line-clamp-3", children: s.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-4 pt-4 border-t", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
          content.filter((c) => c.series_id === s.id).length,
          " items"
        ] }),
        /* @__PURE__ */ jsx("button", { className: "text-sm text-primary hover:underline", children: "View Series" })
      ] })
    ] }) }, s.id)) }) : content.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-4", children: content.map((item) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-start gap-4 p-4 transition-colors border rounded-lg bg-card hover:border-primary/50",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-40 h-24 overflow-hidden rounded-lg bg-muted", children: renderThumbnail(item) }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("h3", { className: `font-medium transition-colors hover:text-primary ${getTextLanguageClass(item.title)}`, children: item.title }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs capitalize text-muted-foreground", children: [
                  "(",
                  item.type,
                  ")"
                ] }),
                item.featured && /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary", children: "Featured" }),
                item.is_full_book === false && /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 text-xs rounded-full bg-orange-500/10 text-orange-500", children: "Summary" })
              ] }),
              (item.excerpt || item.description) && /* @__PURE__ */ jsx("p", { className: `mt-1 text-sm text-muted-foreground line-clamp-2 ${getTextLanguageClass(item.excerpt || item.description || "")}`, children: item.excerpt || item.description }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `px-2 py-0.5 text-xs rounded-full ${item.status === "published" ? "bg-green-100 text-green-700" : item.status === "draft" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`,
                    children: item.status.charAt(0).toUpperCase() + item.status.slice(1)
                  }
                ),
                item.category && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "•" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: item.category })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "•" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: new Date(item.created_at).toLocaleDateString() })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleToggleFeature(item),
                  className: `p-2 text-sm transition-colors border rounded-lg ${item.featured ? "bg-primary/10 text-primary border-primary" : "hover:bg-primary hover:text-white hover:border-primary"}`,
                  title: item.featured ? "Remove from featured" : "Add to featured",
                  children: /* @__PURE__ */ jsx(Star, { className: `w-4 h-4 ${item.featured ? "fill-current" : ""}` })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEdit(item);
                  },
                  className: "p-2 text-sm transition-colors border rounded-lg hover:bg-primary hover:text-white hover:border-primary",
                  children: /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePreview(item);
                  },
                  className: "p-2 text-sm transition-colors border rounded-lg hover:bg-primary hover:text-white hover:border-primary",
                  children: /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(item);
                  },
                  className: "p-2 text-sm transition-colors border rounded-lg hover:bg-destructive hover:text-white hover:border-destructive",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                }
              )
            ] })
          ] }) })
        ]
      },
      `${item.type}-${item.id}`
    )) }) : /* @__PURE__ */ jsxs("div", { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsx("h3", { className: "mb-2 text-lg font-medium", children: "No content found" }),
      /* @__PURE__ */ jsx("p", { className: "mb-6 text-muted-foreground", children: "Get started by creating your first piece of content" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate(`/dashboard/${profile == null ? void 0 : profile.username}/content/new/${activeTab === "all" ? "article" : activeTab.slice(0, -1)}`),
          className: "inline-flex items-center gap-2 px-4 py-2 transition-colors rounded-lg bg-primary text-primary-foreground hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Create ",
              activeTab === "all" ? "Content" : activeTab.slice(0, -1)
            ] })
          ]
        }
      )
    ] })
  ] });
}
export {
  ContentPage
};
