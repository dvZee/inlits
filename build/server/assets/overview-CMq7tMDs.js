import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { u as useAuth, s as supabase } from "./server-build-CUWZnfIj.js";
import { PenSquare, BookOpen, Calendar, BarChart3, Settings, Loader2, AlertCircle, ArrowUp, ArrowDown, Eye, Users, DollarSign, ChevronRight, Plus, TrendingUp, FileText, Mic, Headphones } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function DashboardOverviewPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadDashboardData = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const { data: statsData, error: statsError } = await supabase.rpc("get_creator_stats", {
        creator_id: profile.id,
        period: "month"
      });
      if (statsError) {
        console.error("Stats error:", statsError);
        throw statsError;
      }
      if (statsData == null ? void 0 : statsData[0]) {
        setStats(statsData[0]);
      }
      const [articlesData, booksData, audiobooksData, podcastsData] = await Promise.all([
        // Get recent articles
        supabase.from("articles").select("id, title, cover_url, created_at, view_count, featured, series_id").eq("author_id", profile.id).order("created_at", { ascending: false }).limit(5),
        // Get recent books
        supabase.from("books").select("id, title, cover_url, created_at, view_count, featured, series_id").eq("author_id", profile.id).order("created_at", { ascending: false }).limit(5),
        // Get recent audiobooks
        supabase.from("audiobooks").select("id, title, cover_url, created_at, view_count, featured, series_id").eq("author_id", profile.id).order("created_at", { ascending: false }).limit(5),
        // Get recent podcasts
        supabase.from("podcast_episodes").select("id, title, cover_url, created_at, view_count, featured, series_id").eq("author_id", profile.id).order("created_at", { ascending: false }).limit(5)
      ]);
      if (articlesData.error) throw articlesData.error;
      if (booksData.error) throw booksData.error;
      if (audiobooksData.error) throw audiobooksData.error;
      if (podcastsData.error) throw podcastsData.error;
      const allContent = [
        ...(articlesData.data || []).map((item) => ({ ...item, type: "article", views: item.view_count || 0 })),
        ...(booksData.data || []).map((item) => ({ ...item, type: "book", views: item.view_count || 0 })),
        ...(audiobooksData.data || []).map((item) => ({ ...item, type: "audiobook", views: item.view_count || 0 })),
        ...(podcastsData.data || []).map((item) => ({ ...item, type: "podcast", views: item.view_count || 0 }))
      ];
      allContent.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentContent(allContent.slice(0, 8));
    } catch (error2) {
      console.error("Error loading dashboard data:", error2);
      setError(error2 instanceof Error ? error2.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [profile]);
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  const formatNumber = (num) => {
    if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + "M";
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + "K";
    }
    return num.toString();
  };
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  const formatGrowth = (value) => {
    if (!value) return "+0%";
    return value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };
  const getContentIcon = (type) => {
    switch (type) {
      case "article":
        return /* @__PURE__ */ jsx(PenSquare, { className: "w-4 h-4" });
      case "book":
        return /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4" });
      case "audiobook":
        return /* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4" });
      case "podcast":
        return /* @__PURE__ */ jsx(Mic, { className: "w-4 h-4" });
      default:
        return /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" });
    }
  };
  [
    {
      id: "create-content",
      title: "Create Content",
      description: "Write a new article or post",
      icon: PenSquare,
      href: `/dashboard/${profile == null ? void 0 : profile.username}/content/new/article`
    },
    {
      id: "new-series",
      title: "New Series",
      description: "Start a content series",
      icon: BookOpen,
      href: `/dashboard/${profile == null ? void 0 : profile.username}/content`
    },
    {
      id: "schedule-session",
      title: "Schedule Session",
      description: "Set up availability",
      icon: Calendar,
      href: `/dashboard/${profile == null ? void 0 : profile.username}/appointments`
    },
    {
      id: "analytics-report",
      title: "Analytics Report",
      description: "View detailed insights",
      icon: BarChart3,
      href: `/dashboard/${profile == null ? void 0 : profile.username}/analytics`
    },
    {
      id: "update-settings",
      title: "Update Settings",
      description: "Manage your profile",
      icon: Settings,
      href: `/dashboard/${profile == null ? void 0 : profile.username}/settings`
    }
  ];
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-[400px]", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Loading dashboard data..." })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-[400px] space-y-4", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive" }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "Failed to load dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: error })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => loadDashboardData(),
          className: "px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors",
          children: "Try Again"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-card rounded-lg p-6 border shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Total Views" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: formatNumber((stats == null ? void 0 : stats.total_views) || 0) }),
            /* @__PURE__ */ jsxs("div", { className: `flex items-center text-sm ${((stats == null ? void 0 : stats.views_growth) || 0) >= 0 ? "text-green-500" : "text-red-500"}`, children: [
              ((stats == null ? void 0 : stats.views_growth) || 0) >= 0 ? /* @__PURE__ */ jsx(ArrowUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ArrowDown, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: formatGrowth((stats == null ? void 0 : stats.views_growth) || 0) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Eye, { className: "w-6 h-6 text-primary" }) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-card rounded-lg p-6 border shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Total Followers" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: formatNumber((stats == null ? void 0 : stats.total_followers) || 0) }),
            /* @__PURE__ */ jsxs("div", { className: `flex items-center text-sm ${((stats == null ? void 0 : stats.followers_growth) || 0) >= 0 ? "text-green-500" : "text-red-500"}`, children: [
              ((stats == null ? void 0 : stats.followers_growth) || 0) >= 0 ? /* @__PURE__ */ jsx(ArrowUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ArrowDown, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: formatGrowth((stats == null ? void 0 : stats.followers_growth) || 0) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Users, { className: "w-6 h-6 text-primary" }) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-card rounded-lg p-6 border shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Total Earnings" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: formatMoney((stats == null ? void 0 : stats.total_earnings) || 0) }),
            /* @__PURE__ */ jsxs("div", { className: `flex items-center text-sm ${((stats == null ? void 0 : stats.earnings_growth) || 0) >= 0 ? "text-green-500" : "text-red-500"}`, children: [
              ((stats == null ? void 0 : stats.earnings_growth) || 0) >= 0 ? /* @__PURE__ */ jsx(ArrowUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ArrowDown, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: formatGrowth((stats == null ? void 0 : stats.earnings_growth) || 0) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(DollarSign, { className: "w-6 h-6 text-primary" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Recent Content" }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/dashboard/${profile == null ? void 0 : profile.username}/content`,
            className: "text-sm text-primary hover:underline flex items-center gap-1",
            children: [
              "View all content",
              /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
            ]
          }
        )
      ] }),
      recentContent.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: recentContent.map((item) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "group bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "aspect-video relative", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.cover_url || `https://source.unsplash.com/random/800x600?${item.type}&sig=${item.id}`,
                  alt: item.title,
                  className: "w-full h-full object-cover"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end", children: /* @__PURE__ */ jsx("div", { className: "p-4 w-full", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-white", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm", children: formatNumber(item.views) })
                ] }),
                item.featured && /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-1 bg-primary/80 rounded-full", children: "Featured" })
              ] }) }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground mb-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  getContentIcon(item.type),
                  /* @__PURE__ */ jsx("span", { className: "capitalize", children: item.type })
                ] }),
                /* @__PURE__ */ jsx("span", { children: "•" }),
                /* @__PURE__ */ jsx("span", { children: formatDate(item.created_at) })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "font-medium line-clamp-2 group-hover:text-primary transition-colors", children: item.title })
            ] })
          ]
        },
        `${item.type}-${item.id}`
      )) }) : /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-8 text-center", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "No content yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "Start creating content to see it here" }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/dashboard/${profile == null ? void 0 : profile.username}/content/new/article`,
            className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Create your first content"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6 shadow-sm", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-6", children: "Growth Overview" }),
        /* @__PURE__ */ jsx("div", { className: "h-[300px] flex items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "w-12 h-12 mx-auto mb-4 text-primary/50" }),
          /* @__PURE__ */ jsx("p", { children: "Growth chart visualization coming soon" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm mt-2", children: "Track your content performance over time" })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6 shadow-sm", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-6", children: "Content Breakdown" }),
        recentContent.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: ["article", "book", "audiobook", "podcast"].map((type) => {
            const count = recentContent.filter((item) => item.type === type).length;
            const percentage = recentContent.length > 0 ? Math.round(count / recentContent.length * 100) : 0;
            return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  getContentIcon(type),
                  /* @__PURE__ */ jsxs("span", { className: "capitalize", children: [
                    type,
                    "s"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("span", { children: count })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-2 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-full bg-primary transition-all",
                  style: { width: `${percentage}%` }
                }
              ) })
            ] }, type);
          }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium mb-3", children: "Featured Content" }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
              recentContent.filter((item) => item.featured).length,
              " of ",
              recentContent.length,
              " items featured"
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-[200px] text-muted-foreground", children: "No content data available" })
      ] }) })
    ] })
  ] });
}
export {
  DashboardOverviewPage
};
