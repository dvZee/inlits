import { jsxs, jsx } from "react/jsx-runtime";
import { Heart, MessageCircle, Share2, Bookmark, AlertCircle } from "lucide-react";
import React__default, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { a as useOptimisticMutation, s as supabase } from "./server-build-yCr6HHQW.js";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "clsx";
import "tailwind-merge";
function QuickBiteCard({ bite }) {
  const [isLiked, setIsLiked] = React__default.useState(bite.liked || false);
  const [likeCount, setLikeCount] = React__default.useState(bite.likes);
  const { mutate: toggleLike } = useOptimisticMutation({
    mutationFn: async () => {
      if (isLiked) {
        const { error } = await supabase.from("quick_bite_likes").delete().eq("bite_id", bite.id);
        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase.from("quick_bite_likes").insert({ bite_id: bite.id });
        if (error) throw error;
        return true;
      }
    },
    optimisticUpdate: () => {
      setIsLiked(!isLiked);
      setLikeCount((prev) => prev + (isLiked ? -1 : 1));
    },
    rollbackUpdate: () => {
      setIsLiked(!isLiked);
      setLikeCount((prev) => prev + (isLiked ? 1 : -1));
    },
    invalidateQueries: [`quick-bites:${bite.id}`]
  });
  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleLike();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg overflow-hidden mb-4 max-w-xl mx-auto", children: [
    /* @__PURE__ */ jsx("div", { className: "p-4 flex items-center justify-between", children: /* @__PURE__ */ jsxs(
      Link,
      {
        to: `/creator/${bite.creator.id}`,
        className: "flex items-center gap-2",
        children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: bite.creator.avatar,
              alt: bite.creator.name,
              className: "w-10 h-10 rounded-full object-cover"
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: bite.creator.username }),
              bite.creator.verified && /* @__PURE__ */ jsx("span", { className: "text-primary", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: bite.creator.name })
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "px-4 py-6 bg-muted/30", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg whitespace-pre-line", style: { fontFamily: "Georgia, serif" }, children: bite.content }),
      /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
        "#",
        bite.type
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleLikeClick,
            className: `flex items-center gap-1 ${isLiked ? "text-red-500" : "hover:text-red-500"} transition-colors`,
            children: [
              /* @__PURE__ */ jsx(Heart, { className: `w-5 h-5 ${isLiked ? "fill-current" : ""}` }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: likeCount })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-1 hover:text-primary transition-colors", children: [
          /* @__PURE__ */ jsx(MessageCircle, { className: "w-5 h-5" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: bite.comments })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "hover:text-primary transition-colors", children: /* @__PURE__ */ jsx(Share2, { className: "w-5 h-5" }) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: `${bite.saved ? "text-primary" : "hover:text-primary"} transition-colors`,
          children: /* @__PURE__ */ jsx(Bookmark, { className: `w-5 h-5 ${bite.saved ? "fill-current" : ""}` })
        }
      )
    ] })
  ] });
}
function QuickBitesFeed() {
  const [bites, setBites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loadMoreBites = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      const newBites = Array.from({ length: 5 }, (_, i) => ({
        id: `${Date.now()}-${page}-${i}`,
        content: [
          "The only way to do great work is to love what you do.",
          "In the midst of chaos, there is also opportunity.",
          "Life is what happens while you're busy making other plans.",
          "Two roads diverged in a wood, and I—\nI took the one less traveled by,\nAnd that has made all the difference.",
          "Success is not final, failure is not fatal:\nit is the courage to continue that counts."
        ][Math.floor(Math.random() * 5)],
        type: ["quote", "poetry", "thought"][Math.floor(Math.random() * 3)],
        creator: {
          id: `creator-${i}`,
          name: `Creator Name ${i}`,
          username: `creator${i}`,
          avatar: `https://source.unsplash.com/random/100x100?face&sig=${Date.now()}-${i}`,
          verified: Math.random() > 0.5
        },
        likes: Math.floor(Math.random() * 1e3),
        comments: Math.floor(Math.random() * 100),
        createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
        liked: Math.random() > 0.7,
        saved: Math.random() > 0.8
      }));
      setBites((prev) => [...prev, ...newBites]);
      setPage((prev) => prev + 1);
      setHasMore(page < 5);
    } catch (error) {
      console.error("Error loading quick bites:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading]);
  useEffect(() => {
    loadMoreBites();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 py-6 space-y-6", children: [
    bites.map((bite) => /* @__PURE__ */ jsx(
      QuickBiteCard,
      {
        bite
      },
      bite.id
    )),
    loading && /* @__PURE__ */ jsx("div", { className: "flex justify-center py-4", children: /* @__PURE__ */ jsxs("div", { className: "animate-pulse flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-primary/50" }),
      /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-primary/50" }),
      /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-primary/50" })
    ] }) })
  ] });
}
function QuickBitesPage() {
  return /* @__PURE__ */ jsxs("div", { className: "relative h-[calc(100vh-8rem)] overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 blur-sm pointer-events-none overflow-hidden", children: /* @__PURE__ */ jsx(QuickBitesFeed, {}) }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center space-y-4 p-6 rounded-lg", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-primary mx-auto" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold", children: "Coming Soon!" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "We're working hard to bring you bite-sized learning content that you can consume on the go. Stay tuned for updates!" })
    ] }) })
  ] });
}
export {
  QuickBitesPage
};
