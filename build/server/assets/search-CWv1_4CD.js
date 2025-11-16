import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import React__default, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { C as ContentCard, i as searchContent } from "./server-build-CQlMvEI0.js";
import { ExternalLink, ChevronLeft, ChevronRight, Filter, X, Loader2, AlertCircle } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function SponsoredCard({ item }) {
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href: item.url,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "group relative bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative aspect-video", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: item.thumbnail,
              alt: item.title,
              className: "w-full h-full object-cover"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "shrink-0 w-9 h-9 rounded-lg overflow-hidden bg-primary/5", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: item.brand.logo,
              alt: item.brand.name,
              className: "w-full h-full object-contain"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium leading-snug line-clamp-2 mb-1", children: item.title }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: item.brand.name }),
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/50", children: "•" }),
              /* @__PURE__ */ jsx("span", { className: "text-primary font-medium", children: "Sponsored" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" }) })
      ]
    }
  );
}
function ContentGrid({
  items,
  sponsoredItems = [],
  page,
  totalPages,
  onPageChange,
  loading = false
}) {
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onPageChange(i),
            className: `px-3 py-1 rounded-md text-sm font-medium transition-colors ${page === i ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
            children: i
          },
          i
        )
      );
    }
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mt-8", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onPageChange(page - 1),
          disabled: page === 1,
          className: "px-3 py-1 rounded-md text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50",
          children: "Previous"
        }
      ),
      startPage > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onPageChange(1),
            className: "px-3 py-1 rounded-md text-sm font-medium transition-colors hover:bg-accent",
            children: "1"
          }
        ),
        startPage > 2 && /* @__PURE__ */ jsx("span", { className: "px-2", children: "..." })
      ] }),
      pages,
      endPage < totalPages && /* @__PURE__ */ jsxs(Fragment, { children: [
        endPage < totalPages - 1 && /* @__PURE__ */ jsx("span", { className: "px-2", children: "..." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onPageChange(totalPages),
            className: "px-3 py-1 rounded-md text-sm font-medium transition-colors hover:bg-accent",
            children: totalPages
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onPageChange(page + 1),
          disabled: page === totalPages,
          className: "px-3 py-1 rounded-md text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50",
          children: "Next"
        }
      )
    ] });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: loading ? (
      // Loading skeletons
      Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "animate-pulse", children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-video bg-muted rounded-lg mb-4" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/2" })
        ] })
      ] }, i))
    ) : items.map((item, index) => {
      const sponsoredIndex = Math.floor(index / 8);
      const sponsoredItem = sponsoredItems[sponsoredIndex];
      return /* @__PURE__ */ jsxs(React__default.Fragment, { children: [
        /* @__PURE__ */ jsx(ContentCard, { item }),
        sponsoredItem && (index + 1) % 8 === 0 && /* @__PURE__ */ jsx(SponsoredCard, { item: sponsoredItem })
      ] }, item.id);
    }) }),
    !loading && totalPages > 1 && renderPagination()
  ] });
}
const contentTypes = [
  { value: "all", label: "All" },
  { value: "article", label: "Articles" },
  { value: "book", label: "E-Books" },
  { value: "audiobook", label: "Audiobooks" },
  { value: "podcast", label: "Podcasts" },
  { value: "summary", label: "Book Summaries" }
];
const sortOptions = [
  { value: "relevance", label: "Most Relevant" },
  { value: "date", label: "Most Recent" },
  { value: "views", label: "Most Viewed" },
  { value: "rating", label: "Highest Rated" }
];
const languages = [
  { value: "all", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "ur", label: "Urdu" },
  { value: "hi", label: "Hindi" }
];
function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [language, setLanguage] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const carouselRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth);
    }
  };
  const handleScroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 200;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };
  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [results]);
  useEffect(() => {
    const loadResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setTotalResults(0);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const { items, total } = await searchContent({
          query,
          type: selectedType === "all" ? void 0 : selectedType,
          limit: 12,
          offset: (page - 1) * 12
        });
        setResults(items);
        setTotalResults(total);
      } catch (err) {
        console.error("Search error:", err);
        setError(err instanceof Error ? err.message : "Failed to load search results");
        setResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [query, selectedType, sortBy, language, page]);
  const handleRetry = () => {
    setError(null);
    setPage(1);
    setLoading(true);
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;
      if (!target.closest("[data-filters]")) {
        setShowFilters(false);
      }
    };
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [showFilters]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold", children: [
      query ? `Search results for "${query}"` : "Search",
      totalResults > 0 && /* @__PURE__ */ jsxs("span", { className: "text-base font-normal text-muted-foreground ml-2", children: [
        totalResults,
        " ",
        totalResults === 1 ? "result" : "results"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex items-center gap-2", children: [
      showLeftScroll && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleScroll("left"),
          className: "absolute left-0 z-20 h-full px-2 flex items-center justify-center bg-gradient-to-r from-background via-background to-transparent",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: carouselRef,
          className: "flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth",
          onScroll: checkScrollButtons,
          children: contentTypes.map((type) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedType(type.value),
              className: `shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedType === type.value ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary hover:text-primary-foreground"}`,
              children: type.label
            },
            type.value
          ))
        }
      ),
      showRightScroll && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleScroll("right"),
          className: "absolute right-[56px] z-20 h-full px-2 flex items-center justify-center bg-gradient-to-l from-background via-background to-transparent",
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", "data-filters": true, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowFilters(!showFilters),
            className: `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors ${showFilters ? "bg-primary text-primary-foreground" : "border hover:bg-primary hover:text-primary-foreground"}`,
            children: [
              /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { className: "hidden md:inline", children: "Filter" })
            ]
          }
        ),
        showFilters && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/20 backdrop-blur-sm z-40" }),
          /* @__PURE__ */ jsx("div", { className: "fixed inset-y-0 right-0 w-full md:w-[400px] bg-background border-l shadow-xl z-50", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Filters" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setShowFilters(false),
                  className: "p-2 hover:bg-muted rounded-full transition-colors",
                  children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 p-6 space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium mb-3", children: "Sort By" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-2", children: sortOptions.map((option) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      setSortBy(option.value);
                      setShowFilters(false);
                    },
                    className: `w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${sortBy === option.value ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground"}`,
                    children: option.label
                  },
                  option.value
                )) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium mb-3", children: "Language" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-2", children: languages.map((option) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      setLanguage(option.value);
                      setShowFilters(false);
                    },
                    className: `w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${language === option.value ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground"}`,
                    children: option.label
                  },
                  option.value
                )) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "p-4 border-t", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setSortBy("relevance");
                  setLanguage("all");
                  setShowFilters(false);
                },
                className: "w-full px-4 py-2 text-sm text-primary hover:underline",
                children: "Reset all filters"
              }
            ) })
          ] }) })
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "min-h-[400px] flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) }) : error ? /* @__PURE__ */ jsxs("div", { className: "min-h-[400px] flex flex-col items-center justify-center text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-destructive", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleRetry,
          className: "mt-4 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors",
          children: "Try again"
        }
      )
    ] }) : results.length > 0 ? /* @__PURE__ */ jsx(
      ContentGrid,
      {
        items: results,
        page,
        totalPages: Math.ceil(totalResults / 12),
        onPageChange: setPage
      }
    ) : query ? /* @__PURE__ */ jsx("div", { className: "min-h-[400px] flex items-center justify-center text-center", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-medium", children: "No results found" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Try adjusting your search or filters to find what you're looking for" })
    ] }) }) : /* @__PURE__ */ jsx("div", { className: "min-h-[400px] flex items-center justify-center text-center", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Enter a search term to find content" }) })
  ] });
}
export {
  SearchPage,
  SearchPage as default
};
