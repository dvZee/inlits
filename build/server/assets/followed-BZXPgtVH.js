import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, Heart } from "lucide-react";
function CreatorCard({ creator, onFollow }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "h-32 bg-gradient-to-r from-primary/10 to-primary/5" }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 -mt-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-4 mb-4", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: creator.avatar,
            alt: creator.name,
            className: "w-24 h-24 rounded-full border-4 border-background object-cover"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 pb-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: creator.name }),
            creator.verified && /* @__PURE__ */ jsx("span", { className: "text-primary", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsx(
              "path",
              {
                d: "M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round"
              }
            ) }) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "@",
            creator.username
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onFollow(creator.id),
            className: `px-4 py-2 rounded-full text-sm font-medium transition-colors ${creator.isFollowing ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-primary text-primary-foreground hover:bg-primary/90"}`,
            children: creator.isFollowing ? "Following" : "Follow"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: creator.bio }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("strong", { children: creator.stats.followers.toLocaleString() }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: " followers" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("strong", { children: creator.stats.content.toLocaleString() }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: " content" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Heart, { className: "w-4 h-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("strong", { children: creator.stats.likes.toLocaleString() }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: " likes" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium mb-3", children: "Recent Content" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2", children: creator.recentContent.map((content) => /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/content/${content.id}`,
            className: "relative aspect-square rounded-md overflow-hidden group",
            children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: content.thumbnail,
                  alt: content.title,
                  className: "w-full h-full object-cover"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity", children: content.type }) })
            ]
          },
          content.id
        )) })
      ] })
    ] })
  ] });
}
function FollowedCreatorsGrid() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(false);
  const loadCreators = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      const mockCreators = Array.from({ length: 9 }, (_, i) => ({
        id: `creator-${i}`,
        username: `creator${i}`,
        name: `Creator Name ${i}`,
        avatar: `https://source.unsplash.com/random/200x200?portrait&sig=${Date.now()}-${i}`,
        bio: "Creating educational content to help people learn and grow. Focused on technology, science, and personal development.",
        verified: Math.random() > 0.5,
        stats: {
          followers: Math.floor(Math.random() * 1e5),
          content: Math.floor(Math.random() * 500),
          likes: Math.floor(Math.random() * 1e6)
        },
        recentContent: Array.from({ length: 6 }, (_2, j) => ({
          id: `content-${i}-${j}`,
          title: `Content Title ${j}`,
          thumbnail: `https://source.unsplash.com/random/400x400?education&sig=${Date.now()}-${i}-${j}`,
          type: ["Article", "Video", "Podcast", "E-Book"][Math.floor(Math.random() * 4)]
        })),
        isFollowing: true
      }));
      setCreators(mockCreators);
    } catch (error) {
      console.error("Error loading creators:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadCreators();
  }, []);
  const handleFollow = (creatorId) => {
    setCreators((prev) => prev.map(
      (creator) => creator.id === creatorId ? { ...creator, isFollowing: !creator.isFollowing } : creator
    ));
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg overflow-hidden animate-pulse", children: [
      /* @__PURE__ */ jsx("div", { className: "h-32 bg-muted" }),
      /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-24 h-24 rounded-full bg-muted" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
            /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-2/3" }),
            /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/2" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-5/6" })
        ] })
      ] })
    ] }, i)) });
  }
  if (creators.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "No creators followed yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Follow some creators to see their content here" })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: creators.map((creator) => /* @__PURE__ */ jsx(
    CreatorCard,
    {
      creator,
      onFollow: handleFollow
    },
    creator.id
  )) });
}
function FollowedPage() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Followed Creators" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Stay updated with your favorite creators" })
    ] }),
    /* @__PURE__ */ jsx(FollowedCreatorsGrid, {})
  ] });
}
export {
  FollowedPage
};
