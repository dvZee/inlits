import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useLocation, useParams, Navigate, Link, Outlet } from "react-router-dom";
import { u as useAuth, c as useTheme } from "./server-build-CQlMvEI0.js";
import { ChevronLeft, Plus, Sun, Moon, Bell, X, LayoutDashboard, FileText, DollarSign, Calendar, BarChart3, Users, Settings, PenSquare, BookText, Headphones, Mic } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
const sidebarItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    path: ""
  },
  {
    id: "content",
    label: "Content",
    icon: FileText,
    path: "/content"
  },
  {
    id: "earnings",
    label: "Earnings",
    icon: DollarSign,
    path: "/earnings"
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: Calendar,
    path: "/appointments"
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/analytics"
  },
  {
    id: "community",
    label: "Community",
    icon: Users,
    path: "/community"
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings"
  }
];
const createOptions = [
  {
    id: "article",
    label: "Article",
    description: "Write an article, blog post, or tutorial",
    icon: PenSquare,
    path: "/content/new/article"
  },
  {
    id: "book",
    label: "Book",
    description: "Create a full-length book or ebook",
    icon: BookText,
    path: "/content/new/book"
  },
  {
    id: "audiobook",
    label: "Audiobook",
    description: "Record or upload an audiobook",
    icon: Headphones,
    path: "/content/new/audiobook"
  },
  {
    id: "podcast",
    label: "Podcast",
    description: "Start a new podcast episode",
    icon: Mic,
    path: "/content/new/podcast"
  }
];
function DashboardLayout() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const { username } = useParams();
  const { theme, setTheme } = useTheme();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const isBrowser = typeof window !== "undefined";
  const [isMobile, setIsMobile] = useState(
    () => isBrowser ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isBrowser]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" }) });
  }
  if (!user || !profile) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/signin", state: { from: location }, replace: true });
  }
  if (username !== profile.username) {
    return /* @__PURE__ */ jsx(Navigate, { to: `/dashboard/${profile.username}`, replace: true });
  }
  const currentSection = location.pathname.split("/").pop();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[hsl(var(--content-background))]", children: [
    /* @__PURE__ */ jsx("header", { className: "h-14 border-b bg-[hsl(var(--sidebar-background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--sidebar-background))]/60 fixed top-0 left-0 right-0 z-50", children: /* @__PURE__ */ jsxs("div", { className: "container h-full flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2 text-primary hover:text-primary/90", children: [
          /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium hidden sm:inline", children: "Back to Inlits" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-4 w-px bg-border" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium hidden md:inline", children: "Creator Dashboard" }),
        isMobile && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowMobileSidebar(true),
            className: "p-2 hover:bg-accent rounded-lg transition-colors md:hidden",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowCreateDialog(true),
            className: "flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium hidden sm:inline", children: "Create" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
            className: "p-2 hover:bg-accent/10 rounded-lg transition-colors hidden sm:block",
            children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Moon, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsx("button", { className: "p-2 hover:bg-accent/10 rounded-lg transition-colors", children: /* @__PURE__ */ jsx(Bell, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 hidden sm:flex", children: [
          (profile == null ? void 0 : profile.avatar_url) ? /* @__PURE__ */ jsx(
            "img",
            {
              src: profile.avatar_url,
              alt: profile.username,
              className: "w-8 h-8 rounded-full"
            }
          ) : /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium", children: profile == null ? void 0 : profile.username[0].toUpperCase() }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium", children: (profile == null ? void 0 : profile.name) || (profile == null ? void 0 : profile.username) }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Creator" })
          ] })
        ] }),
        isMobile && /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full overflow-hidden sm:hidden", children: (profile == null ? void 0 : profile.avatar_url) ? /* @__PURE__ */ jsx(
          "img",
          {
            src: profile.avatar_url,
            alt: profile.username,
            className: "w-full h-full object-cover"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs", children: profile == null ? void 0 : profile.username[0].toUpperCase() }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "pt-14 flex", children: [
      /* @__PURE__ */ jsx("aside", { className: "w-64 border-r fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-[hsl(var(--sidebar-background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--sidebar-background))]/60 hidden md:block", children: /* @__PURE__ */ jsx("nav", { className: "p-4 space-y-2", children: sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === `/dashboard/${username}${item.path}`;
        return /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/dashboard/${username}${item.path}`,
            className: `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 hover:text-primary"}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: item.label })
            ]
          },
          item.id
        );
      }) }) }),
      isMobile && showMobileSidebar && /* @__PURE__ */ jsx(
        "div",
        {
          className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden",
          onClick: () => setShowMobileSidebar(false),
          children: /* @__PURE__ */ jsxs(
            "div",
            {
              className: "fixed left-0 top-0 bottom-0 w-64 bg-[hsl(var(--sidebar-background))] border-r shadow-xl transform transition-transform duration-300",
              onClick: (e) => e.stopPropagation(),
              children: [
                /* @__PURE__ */ jsxs("div", { className: "h-14 border-b flex items-center justify-between px-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    (profile == null ? void 0 : profile.avatar_url) ? /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: profile.avatar_url,
                        alt: profile.username,
                        className: "w-8 h-8 rounded-full"
                      }
                    ) : /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm", children: profile == null ? void 0 : profile.username[0].toUpperCase() }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "font-medium text-sm", children: (profile == null ? void 0 : profile.name) || (profile == null ? void 0 : profile.username) }),
                      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Creator" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setShowMobileSidebar(false),
                      className: "p-2 hover:bg-accent rounded-lg transition-colors",
                      children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("nav", { className: "p-4 space-y-2", children: [
                  sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === `/dashboard/${username}${item.path}`;
                    return /* @__PURE__ */ jsxs(
                      Link,
                      {
                        to: `/dashboard/${username}${item.path}`,
                        onClick: () => setShowMobileSidebar(false),
                        className: `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 hover:text-primary"}`,
                        children: [
                          /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5" }),
                          /* @__PURE__ */ jsx("span", { className: "font-medium", children: item.label })
                        ]
                      },
                      item.id
                    );
                  }),
                  /* @__PURE__ */ jsx("div", { className: "pt-4 mt-4 border-t", children: /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
                      className: "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-primary/10 hover:text-primary w-full",
                      children: [
                        theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Moon, { className: "w-5 h-5" }),
                        /* @__PURE__ */ jsx("span", { className: "font-medium", children: theme === "dark" ? "Light Mode" : "Dark Mode" })
                      ]
                    }
                  ) })
                ] })
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ jsx("main", { className: `flex-1 transition-all duration-300 ${isMobile ? "ml-0" : "ml-64"}`, children: /* @__PURE__ */ jsx("div", { className: "container py-6", children: /* @__PURE__ */ jsx(Outlet, {}) }) })
    ] }),
    showCreateDialog && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
        onClick: () => setShowCreateDialog(false),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-background rounded-xl shadow-xl w-full max-w-[400px] mx-4 relative animate-in fade-in-0 zoom-in-95 duration-200",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [
                /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Create Content" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowCreateDialog(false),
                    className: "p-1 hover:bg-accent/10 rounded-lg transition-colors",
                    children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "p-2", children: (location.pathname.includes("/content") ? createOptions : createOptions.filter(
                (option) => currentSection == null ? void 0 : currentSection.includes(option.id)
              )).map((option) => /* @__PURE__ */ jsxs(
                Link,
                {
                  to: `/dashboard/${username}${option.path}`,
                  className: "flex items-center gap-3 p-4 rounded-lg hover:bg-accent/10 transition-colors",
                  onClick: () => setShowCreateDialog(false),
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(option.icon, { className: "w-5 h-5" }) }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("h3", { className: "font-medium", children: option.label }),
                      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: option.description })
                    ] })
                  ]
                },
                option.id
              )) })
            ]
          }
        )
      }
    )
  ] });
}
export {
  DashboardLayout
};
